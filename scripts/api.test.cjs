const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');

// Compile application TypeScript in memory; replace only Vite's build-time environment.
const cache = new Map();
function load(sourcePath) {
  const filename = path.resolve(__dirname, '..', sourcePath);
  if (cache.has(filename)) return cache.get(filename).exports;
  const mod = new Module(filename, module);
  cache.set(filename, mod);
  mod.filename = filename;
  mod.paths = Module._nodeModulePaths(path.dirname(filename));
  const normalRequire = mod.require.bind(mod);
  mod.require = (specifier) => {
    if (specifier.startsWith('@/')) return load(`src/${specifier.slice(2)}.ts`);
    if (specifier.startsWith('.')) {
      return load(
        path.relative(
          path.resolve(__dirname, '..'),
          path.resolve(path.dirname(filename), `${specifier}.ts`),
        ),
      );
    }
    return normalRequire(specifier);
  };
  const source = fs.readFileSync(filename, 'utf8').replaceAll('import.meta.env', '{}');
  const result = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2023, module: ts.ModuleKind.CommonJS },
  });
  mod._compile(result.outputText, filename);
  return mod.exports;
}
const { api, unwrap, errorMessage, API_BASE_URL } = load('src/api/client.ts');
const { uploadVideo } = load('src/api/videos.ts');
const { waitForJob, getJob } = load('src/api/jobs.ts');
const { getTranscript } = load('src/api/transcript.ts');
const { createRecommendation, getRecommendation } = load('src/api/recommendations.ts');
const { createRender, getRender, toTimeRanges, renderFileUrl, downloadRenderFile } =
  load('src/api/renders.ts');
const { AxiosError } = require('axios');
const ok = (config, data) => ({
  config,
  data: { success: true, data, error: null },
  status: 200,
  statusText: 'OK',
  headers: {},
});
const job = (state, more = {}) => ({
  jobId: 'job-1',
  videoId: 'video-1',
  kind: 'prepare',
  state,
  stage: null,
  progress: state === 'succeeded' ? 100 : 0,
  resultRef: null,
  errorMessage: null,
  ...more,
});

test('multipart upload sends the file and retains accepted identifiers', async () => {
  const file = new File(['video'], 'sample.mp4', { type: 'video/mp4' });
  api.defaults.adapter = async (config) => {
    assert.equal(config.method, 'post');
    assert.equal(config.url, '/api/videos');
    assert.equal(config.data.get('file').name, file.name);
    assert.equal(config.timeout, 0);
    return ok(config, { videoId: 'video-1', jobId: 'job-1' });
  };
  assert.deepEqual(await uploadVideo(file), { videoId: 'video-1', jobId: 'job-1' });
});
test('job lookup encodes path identifiers', async () => {
  api.defaults.adapter = async (config) => {
    assert.equal(config.url, '/api/jobs/a%2Fb');
    return ok(config, job('succeeded'));
  };
  assert.equal((await getJob('a/b')).state, 'succeeded');
});
test('queued job waits before the next request and stops on success', async (context) => {
  context.mock.timers.enable({ apis: ['setTimeout'] });
  let calls = 0;
  const updates = [];
  api.defaults.adapter = async (config) =>
    ok(config, job(++calls === 1 ? 'queued' : 'succeeded', { resultRef: 'render-1' }));
  const pending = waitForJob('job-1', new AbortController().signal, (value) =>
    updates.push(value.state),
  );
  await new Promise(setImmediate);
  assert.equal(calls, 1);
  context.mock.timers.tick(2000);
  assert.equal((await pending).resultRef, 'render-1');
  assert.equal(calls, 2);
  assert.deepEqual(updates, ['queued', 'succeeded']);
});
test('HTTP 200 failed job rejects and stops polling', async () => {
  let calls = 0;
  api.defaults.adapter = async (config) => {
    calls++;
    return ok(config, job('failed', { errorMessage: '분석 실패' }));
  };
  await assert.rejects(waitForJob('job-1', new AbortController().signal), /분석 실패/);
  assert.equal(calls, 1);
});
test('aborting a queued job cancels its waiting timer', async () => {
  let calls = 0;
  const controller = new AbortController();
  api.defaults.adapter = async (config) => {
    calls++;
    return ok(config, job('running'));
  };
  const pending = waitForJob('job-1', controller.signal);
  await new Promise(setImmediate);
  controller.abort();
  await assert.rejects(pending, { name: 'AbortError' });
  assert.equal(calls, 1);
});
test('transcript preserves fractional times and empty results', async () => {
  const segments = [{ startSeconds: 1.234, endSeconds: 2.567, text: '자막' }];
  api.defaults.adapter = async (config) => {
    assert.equal(config.url, '/api/videos/video-1/transcript');
    return ok(config, { segments });
  };
  assert.deepEqual(await getTranscript('video-1'), segments);
  api.defaults.adapter = async (config) => ok(config, { segments: [] });
  assert.deepEqual(await getTranscript('video-1'), []);
});
test('recommendation POST sends query and integer duration, including empty recommendations', async () => {
  api.defaults.adapter = async (config) => {
    assert.equal(config.url, '/api/videos/video-1/recommendations');
    assert.deepEqual(JSON.parse(config.data), { query: '설명', targetDurationSeconds: 60 });
    return ok(config, { recommendationId: 'rec-1', clips: [] });
  };
  assert.deepEqual((await createRecommendation('video-1', '설명', 60)).clips, []);
});
test('recommendation GET uses stored recommendation ID', async () => {
  api.defaults.adapter = async (config) => {
    assert.equal(config.method, 'get');
    assert.equal(config.url, '/api/videos/video-1/recommendations/rec-1');
    return ok(config, { recommendationId: 'rec-1' });
  };
  assert.equal((await getRecommendation('video-1', 'rec-1')).recommendationId, 'rec-1');
});
test('render POST preserves edit order and millisecond precision without custom subtitles', async () => {
  const clips = toTimeRanges([
    { start: 15.12349, end: 17.78951 },
    { start: 0, end: 2 },
  ]);
  assert.deepEqual(clips, [
    { startSeconds: 15.123, endSeconds: 17.79 },
    { startSeconds: 0, endSeconds: 2 },
  ]);
  api.defaults.adapter = async (config) => {
    assert.equal(config.url, '/api/videos/video-1/renders');
    assert.deepEqual(JSON.parse(config.data), { recommendationId: 'rec-1', clips });
    return ok(config, { videoId: 'video-1', jobId: 'render-job' });
  };
  assert.equal(
    (await createRender('video-1', { recommendationId: 'rec-1', clips })).jobId,
    'render-job',
  );
});
test('render metadata GET retains relative file URL and stub flag', async () => {
  api.defaults.adapter = async (config) => {
    assert.equal(config.url, '/api/videos/video-1/renders/render-1');
    return ok(config, {
      renderId: 'render-1',
      fileUrl: '/api/videos/video-1/renders/render-1/file',
      isStub: true,
    });
  };
  assert.equal((await getRender('video-1', 'render-1')).isStub, true);
});
test('playback and download resolve to API origin and preserve existing query', () => {
  assert.equal(renderFileUrl('/api/file'), `${API_BASE_URL}/api/file`);
  assert.equal(
    renderFileUrl('/api/file?foo=bar', true),
    `${API_BASE_URL}/api/file?foo=bar&download=true`,
  );
  assert.throws(() => renderFileUrl('https://other.example/file'), /주소/);
});
test('file download uses a blob and download=true with cleanup', async (context) => {
  context.mock.timers.enable({ apis: ['setTimeout'] });
  const actions = [];
  const anchor = { click: () => actions.push('click'), remove: () => actions.push('remove') };
  const oldDocument = global.document;
  global.document = { createElement: () => anchor, body: { append: () => actions.push('append') } };
  const oldCreate = URL.createObjectURL;
  const oldRevoke = URL.revokeObjectURL;
  URL.createObjectURL = () => 'blob:result';
  URL.revokeObjectURL = (value) => actions.push(value);
  try {
    api.defaults.adapter = async (config) => {
      assert.equal(config.url, `${API_BASE_URL}/api/file?download=true`);
      assert.equal(config.responseType, 'blob');
      return { ...ok(config, null), data: new Blob(['video'], { type: 'video/mp4' }) };
    };
    await downloadRenderFile('/api/file', '편집본.mp4');
    assert.equal(anchor.download, '편집본.mp4');
    assert.equal(anchor.href, 'blob:result');
    context.mock.timers.tick(60_000);
    assert.deepEqual(actions, ['append', 'click', 'remove', 'blob:result']);
  } finally {
    global.document = oldDocument;
    URL.createObjectURL = oldCreate;
    URL.revokeObjectURL = oldRevoke;
  }
});
test('envelope failures, transport errors and timeout messages remain actionable', () => {
  assert.throws(
    () =>
      unwrap({
        success: false,
        data: null,
        error: { code: 'NOT_READY', message: '분석 중입니다' },
      }),
    /분석 중/,
  );
  const error = new AxiosError('failed', 'ERR_BAD_RESPONSE', {}, null, {
    status: 409,
    data: { error: { message: '준비되지 않았습니다' } },
  });
  assert.equal(errorMessage(error), '준비되지 않았습니다');
  assert.match(errorMessage(new AxiosError('timeout', 'ECONNABORTED')), /초과/);
  assert.match(errorMessage(new AxiosError('network', 'ERR_NETWORK')), /연결/);
});
test('changing video clears server identifiers, recommendations, subtitles and previous render', () => {
  const { useUploadStore } = load('src/store/useUploadStore.ts');
  const { useSegmentStore } = load('src/store/useSegmentStore.ts');
  const { useSubtitleStore } = load('src/store/useSubtitleStore.ts');
  const { useRenderStore } = load('src/store/useRenderStore.ts');
  useUploadStore.getState().setUploaded({ videoId: 'old', jobId: 'old-job' });
  useUploadStore.getState().setPrepared(true);
  useSegmentStore.getState().setRecommendation({
    videoId: 'old',
    recommendationId: 'rec',
    clips: [{ clipId: 'a', startSeconds: 0, endSeconds: 3, reason: '설명' }],
  });
  useSegmentStore.getState().toggleSelected('a');
  useSegmentStore.getState().startEdit();
  useSubtitleStore
    .getState()
    .setSubtitles('old', [{ id: '1', start: 0, end: 1, text: '과거 자막' }]);
  useRenderStore.getState().setRendered('old', 'render', 1);
  useUploadStore.getState().setFile(new File(['new'], 'new.mp4'));
  assert.equal(useUploadStore.getState().videoId, null);
  assert.equal(useUploadStore.getState().prepared, false);
  assert.deepEqual(useSegmentStore.getState().segments, []);
  assert.deepEqual(useSegmentStore.getState().editIds, []);
  assert.deepEqual(useSubtitleStore.getState().subtitles, []);
  assert.equal(useRenderStore.getState().renderId, null);
});

test('loading a new recommendation invalidates an old rendered video', () => {
  const { useRenderStore } = load('src/store/useRenderStore.ts');
  const { useSegmentStore } = load('src/store/useSegmentStore.ts');
  useRenderStore.getState().setRendered('video-1', 'old-render', 1);
  useSegmentStore
    .getState()
    .setRecommendation({ videoId: 'video-1', recommendationId: 'new', clips: [] });
  assert.equal(useRenderStore.getState().renderId, null);
});

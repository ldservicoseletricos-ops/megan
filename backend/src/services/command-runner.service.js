
const fs = require('fs');
const { spawnSync } = require('child_process');

function run(command, args, cwd) {
  try {
    if (!cwd || !fs.existsSync(cwd)) {
      return {
        ok: false,
        status: -1,
        stdout: '',
        stderr: `Diretório não encontrado: ${cwd || '(vazio)'}`
      };
    }

    const result = spawnSync(command, args, {
      cwd,
      encoding: 'utf8',
      shell: process.platform === 'win32'
    });

    return {
      ok: result.status === 0,
      status: typeof result.status === 'number' ? result.status : -1,
      stdout: result.stdout || '',
      stderr: result.stderr || '',
      error: result.error ? String(result.error.message || result.error) : ''
    };
  } catch (error) {
    return {
      ok: false,
      status: -1,
      stdout: '',
      stderr: '',
      error: String(error && error.message ? error.message : error)
    };
  }
}

module.exports = { run };

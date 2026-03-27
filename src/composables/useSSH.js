export function useSSH() {
  function buildSSHCommand(server) {
    return `ssh -p ${server.port} ${server.user}@${server.host}`
  }

  function buildSSHUri(server) {
    return `ssh://${server.user}@${server.host}:${server.port}`
  }

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch (err) {
      console.error('Failed to copy:', err)
      return false
    }
  }

  async function copySSHCommand(server) {
    const cmd = buildSSHCommand(server)
    return await copyToClipboard(cmd)
  }

  return {
    buildSSHCommand,
    buildSSHUri,
    copyToClipboard,
    copySSHCommand,
  }
}

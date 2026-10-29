import { Plugin } from "@opencode/plugin"

/**
 * The server part exists so the package has a stable plugin id, and so its GUI part is discovered by
 * OpenCode Desktop. The statistics themselves are read from the client-side session store, so there is
 * nothing to run on the server yet.
 */
export default Plugin.define({
  id: "opencode-glance",
  async setup() {},
})

# project-flow skill bundle

Ships the `project-flow` skill with the profile instead of a home-directory folder.

- `index.js` registers a readonly skill provider that reads `skills/` inside this package.
- `cordis.patch.yml` inserts the plugin row.
- `skills/project-flow/SKILL.md` is the skill itself.

Install with `plugin_manager` `install_bundle` and this directory as the target.

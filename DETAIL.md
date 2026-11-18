# Project flow skill pack

一个把 `project-flow` skill 直接装在配置里的 bundle。装上后，这个 profile 的每个会话都能在 skill 列表里看到 `project-flow`，不用再手动往 `D:\dsh-home\skills` 放文件。

## 它做什么

- 安装时注册一个只读 skill provider，扫描包内的 `skills/` 目录。
- 目前只带一个 skill：`project-flow`——开工定边界、任务分级、拆活派活、完成定义与验收、收尾交接。

## 怎么用

装好后直接对助手说「按 project-flow 开工」，或让它在你交代长任务时自己加载。

## 限制

- 包内 skill 的优先级是 600，高于用户目录 `D:\dsh-home\skills`（400）。两边同名时以包内为准。
- 不会覆盖、也不会删除你本地的 `project-flow`；想只用包里的那份，可删本地目录，避免同名告警。
- 只读，不写任何文件；卸载 bundle 后 skill 立即消失。

## 验证

1. 装完后在新会话里问「你有哪些 skill」，列表里应出现 `project-flow`，来源是 bundle。
2. 让助手加载它，内容应与 `skills/project-flow/SKILL.md` 一致。

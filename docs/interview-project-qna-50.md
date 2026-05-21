# 面试官 / 合作人常问技术问题 50 条

> 生成依据：个人主页与 CV 数据、Talk-to-Sean 项目文档、Agent 知识库中的学习记录、MergeWarden、RAG、Agent/Workflow、工具分层、Pydantic 约束、评测与上下文工程记录。

## 01. 你怎么介绍自己的技术定位？

参考答案：  
我会把自己定位为 AI Native 开发者，重点不是只会调用模型 API，而是把 LLM 想法做成可追踪、可评测、可部署的系统。我比较关注 Agent、RAG、Workflow、结构化输出、工具调用、上下文工程和评测体系。我的默认工程闭环是：先快速做原型，再暴露工具调用和上下文链路，用评测衡量行为，最后通过 Docker、GitHub Actions、日志和部署保护把系统稳定下来。

## 02. 你做过哪些和 LLM / Agent 相关的项目？

参考答案：  
核心项目有三个方向。第一是 MergeWarden，一个 AI 代码审查 Agent，围绕 diff-first 上下文、工具调用、结构化 submit、golden eval 和误报控制迭代。第二是 Talk-to-Sean，一个基于个人 Wiki grounding 的 Web Chatbot，用结构化知识库约束模型回答我的公开资料，重点是防幻觉和可追溯。第三是 shotgunCV，把简历优化从一次性 prompt 变成 parse、generate、score、rank、strategy 的流水线，更偏 Workflow 和 RAG 数据处理。

## 03. 你怎么理解 Agent 和 Workflow 的区别？

参考答案：  
Workflow 是确定性流程编排，Agent 是带目标的动态决策系统。Workflow 的路径由开发者预先设计，比如解析 JD、解析简历、打分、生成建议；Agent 则会根据当前状态决定下一步读哪个文件、调用什么工具、是否调整计划。我的生产建议是 workflow 外壳加 agent 局部自治：稳定流程由代码控制，不确定的探索和判断交给 Agent。

## 04. 为什么你不建议所有场景都做成纯 Agent？

参考答案：  
纯 Agent 的自由度高，但可控性、可解释性和成本都更难管理。很多业务流程本身是稳定的，用 Workflow 可以更便宜、更可测、更容易排错。Agent 适合信息不完整、需要探索、需要调用工具逐步决策的节点。把整个系统都交给模型，容易出现上下文膨胀、行为不可预测、重试成本高和边界不清晰的问题。

## 05. 你的 Agent 系统可靠性主要靠什么保证？

参考答案：  
我不会把可靠性寄托在 prompt 上。可靠性主要来自工具约束、结构化状态、权限边界、执行反馈、预算控制、日志追踪和评测系统。比如工具调用参数先过 Pydantic 严格校验，真实执行前再做 workspace 边界检查；模型输出必须经过 schema；每次运行有 run_id 和事件日志；最终用 golden set 看命中率、误报率、schema_validity 和耗时。

## 06. MergeWarden 是什么？解决什么问题？

参考答案：  
MergeWarden 是一个 AI 代码审查 Agent，用来审查 PR diff 并输出结构化 review 建议。它不是简单把 diff 丢给模型，而是让模型在 Agent loop 里按需读文件、grep 调用链、分析上下文，最后通过 submit_review 工具提交结构化结果。这个项目重点验证的是：代码审查 Agent 如何在真实代码库里控制上下文、降低误报、保证格式合法，并通过 golden eval 衡量质量。

## 07. MergeWarden 的核心架构怎么拆？

参考答案：  
我把它拆成推理引擎、编排器、工具系统和结果处理几层。InferenceEngine 负责组装消息、调用模型、解析 AnalysisPlan；AgentOrchestrator 负责 prepare、analyze、execute_tools、format_result 的循环；工具层提供 read_file、grep、list_dir 等原子能力；结果层负责 schema 校验、过滤和评测对齐。这样的拆分让模型决策和真实工具执行保持隔离。

## 08. 为什么代码审查 Agent 需要 diff-first？

参考答案：  
代码审查的任务目标首先来自 changed hunk，而不是整个仓库。diff-first 可以让模型先关注变化点，再按需扩展到相关上下文。如果一开始读整文件，容易把上下文窗口塞满，反而挤掉真正需要提交 review 的空间。MergeWarden 后来把 full-file prefetch 改成 changed-hunk 附近窗口，单文件上下文量大幅下降，同时保留 golden issue 证据。

## 09. diff-first 会不会漏掉跨文件影响？

参考答案：  
会有这个风险，所以 diff-first 不是只看 diff。我的理解是先用 diff 定位问题中心，再用工具扩展证据，比如 grep 调用链、读 model 定义、读测试文件。关键是上下文扩展必须有预算边界和证据目标，不能无差别把仓库塞进 prompt。对于跨文件依赖，要通过工具探索和日志记录来补足，而不是回到 full-repo prompt。

## 10. 你怎么设计 Agent 工具系统？

参考答案：  
我倾向三层：底层原子化、中层编排化、上层任务化。底层工具只做一件事，比如读文件、grep、列目录，边界清晰、可审计；中层由模型在 ReAct 循环中动态组合工具；上层才沉淀高频 skill 或子代理。这样既不会让工具黑箱化，也不会让用户面对过长的底层调用链。

## 11. 为什么不把复杂任务直接封装成一个大工具？

参考答案：  
大工具短期看调用简单，但失败后很难定位：到底是检索错、解析错、权限错，还是模型判断错都混在一起。Agent 场景里我更希望底层能力透明、可组合、可审计。常见组合可以沉淀为 skill，但要建立在稳定的原子工具之上，而不是绕过原子层直接做黑箱高阶工具。

## 12. Pydantic 在 Agent Runtime 里起什么作用？

参考答案：  
Pydantic 是模型输出和真实工具执行之间的参数安检门。模型可以生成自由文本，但一旦要调用工具，参数必须满足 schema、类型和逻辑约束。我会用 `strict=True` 和 `extra="forbid"`，禁止隐式类型转换和多余字段。校验失败时不执行工具，而是把结构化错误作为 observation 返回给模型，让它下一轮修正。

## 13. 为什么 Pydantic 校验还不够，还要工具执行层再校验？

参考答案：  
因为 Pydantic 适合做轻量参数结构校验，不应该访问真实文件系统。真实安全边界必须在工具执行函数里做，比如 `Path.resolve()` 后确认路径仍在 workspace 内、文件是否存在、命令是否在白名单里。第一层挡格式和明显非法参数，第二层挡真实资源越界，这是两层防线。

## 14. 你怎么处理模型工具调用参数错误？

参考答案：  
不会直接崩溃，也不会偷偷纠正后执行。Runtime 应该返回结构化错误，比如 error_type、details、expected_schema，让模型知道哪里错了。这样 Agent loop 可以从错误反馈中恢复。如果系统自动帮模型宽松转换，短期成功率可能变高，但长期会隐藏协议问题，安全性和可调试性都会下降。

## 15. 你怎么理解结构化输出？

参考答案：  
结构化输出是把模型从“写一段看起来合理的话”约束成“产出可被程序消费的数据”。在 Agent 和评测系统里，结构化输出很关键，因为后续流程要判断字段、行号、严重级别、证据、置信度。如果输出只是自然语言，就很难自动过滤、评测和追踪。我的经验是，schema 不只是格式问题，也是系统契约。

## 16. MergeWarden 为什么需要 submit_review 这种伪工具？

参考答案：  
submit_review 把最终 review 结果变成 function calling 的 JSON 参数，而不是让模型在正文里自由输出。这样可以复用工具调用协议拿到结构化终稿，也方便做 schema 校验、过滤、统计和 eval。尤其在多轮 Agent 后，最终提交阶段需要明确收口，否则模型容易继续探索或写长篇分析。

## 17. 你遇到过哪些 OpenAI-compatible 模型兼容性问题？

参考答案：  
一个典型问题是 DeepSeek thinking mode 的 `reasoning_content` 回传要求。虽然接口看起来兼容 OpenAI，但在 tool_calls 轮次后，后续请求必须把 assistant 消息里的 reasoning_content 带回去，否则 API 会 400。这说明 OpenAI-compatible 不等于行为完全兼容，接入 provider 时必须读专有字段和消息历史约束。

## 18. 你怎么定位 DeepSeek thinking mode 的问题？

参考答案：  
关键是不要只凭猜测改代码，而是抓 error body，再沿数据流逐节点追踪。我会从 API response、ModelResponse、engine 返回值、agent loop feedback、Message 重建、序列化 payload 一路看 reasoning_content 在哪里丢失。最终修复不是一个点，而是把这个字段在线程里完整传递和回写。

## 19. 为什么 prompt 里写“必须提交”还不够？

参考答案：  
因为对话历史中的行为模式经常强于末尾 prompt 指令。如果前几轮都是 read_file、分析、继续探索，模型在 force-submit 阶段仍可能延续这种模式，写长文而不是调用 submit 工具。所以最终提交最好用协议层强制，比如只暴露 submit 工具、设置 tool_choice，并在 DeepSeek submit-only 阶段禁用 thinking。

## 20. 你怎么控制 Agent 的时间和预算？

参考答案：  
我会同时做硬超时、软预算和退化行为控制。硬超时限制单次模型调用最坏耗时；软预算在 token 或轮次接近上限时停止追加调用；如果超时发生，要避免继续 force-submit 生成虚假结果。只做硬超时可能中断退化，但不一定降低误报；配合超时后禁止强制提交，才能更安全。

## 21. 什么是 golden eval？你怎么用它？

参考答案：  
golden eval 是用已知期望结果的样本集来评估 Agent 行为。对代码审查来说，样本里会有 diff、仓库快照、预期 issue 位置和类别。评测指标包括 schema_validity、hit rate、false positive、耗时、token、是否 placeholder 等。它的价值是把“模型看起来不错”变成可复现的质量信号。

## 22. 你怎么看 hit rate 和 false positive 的权衡？

参考答案：  
这取决于产品目标。代码审查如果上线给人用，误报太多会损害信任，所以 false positive 要控制；但如果是 eval 阶段，过滤器太保守又可能压低 hit rate。我的做法是分清“链路健康”和“质量通过”：schema 合法、无 placeholder、能 submit 说明链路健康；是否命中 golden、是否低误报才说明质量达标。

## 23. 为什么负样本也很重要？

参考答案：  
负样本能暴露模型无中生有的问题。代码审查 Agent 在空标注 PR 上可能因为仓库快照扩大探索面、预算触发强制提交、模型填充低风险 info/style 建议，最终产生误报。没有负样本，只看正样本命中率，会高估系统质量。负样本能帮助定义哪些输出算 bug 级误报，哪些只是低价值建议。

## 24. 你怎么设计 Agent 的可观测性？

参考答案：  
每次运行要有 run_id 串联全链路事件，包括模型调用参数、工具调用、工具结果、token、耗时、finish_reason、submit 是否出现、schema 是否合法、过滤前后 issue 数。对上下文工程，还要记录注入内容体积和截断原因。可观测性不是为了日志好看，而是为了出问题时能还原因果链。

## 25. 你如何理解上下文工程？

参考答案：  
上下文工程不是把更多内容塞给模型，而是在有限窗口里提高有效证据密度。它包括信息选择、优先级、裁剪、压缩、检索、窗口化和状态管理。MergeWarden 的经验是，full-file prefetch 看似信息充分，但会挤占 submit 阶段；changed-hunk 窗口化反而更符合任务目标。

## 26. 你会怎么做上下文压缩？

参考答案：  
我会用结构化记忆加滑动窗口。近期几轮保留原始内容，远历史压成状态，比如目标、约束、决策、错误、当前文件。对长工具结果，只保留和未来决策有关的信息。更进一步可以用 retrieval 按需取回历史，但要加任务 id、时间窗和租户过滤，避免旧任务串台。

## 27. RAG 系统的基本流程是什么？

参考答案：  
离线阶段是加载文档、切分、embedding、写入向量库；在线阶段是用户 query、query embedding、top-k 检索、可选 rerank、拼 prompt、调用 LLM 生成答案。关键不是“接了向量库”就算 RAG，而是 chunk、metadata、过滤、排序、上下文拼接和不知道时拒答都要设计。

## 28. 你怎么选择 HNSW 和 IVF？

参考答案：  
HNSW 是分层图导航结构，查询快、精度高、支持动态插入，适合在线服务，但内存占用较高。IVF 用聚类把向量分桶，内存更友好，适合大规模离线或批处理，但动态更新成本高、精度依赖聚类质量。小到中等规模、在线 RAG 或 Agent memory，我会优先考虑 HNSW。

## 29. Chroma 和 Qdrant 怎么选？

参考答案：  
Chroma 更适合本地开发、Demo、小规模验证，使用门槛低。Qdrant 更偏生产，支持 HNSW、payload filter、持久化、API/SDK 和更强并发。我的选择逻辑是：快速实验可以 Chroma；一旦需要过滤、租户隔离、稳定持久化和服务化，就应该迁到 Qdrant。

## 30. 为什么 RAG 常需要 hybrid search？

参考答案：  
只用向量检索容易漏掉专有名词、API 名、数字、错误码等精确匹配；只用 BM25 又不理解语义和同义表达。Hybrid search 用 BM25 保精确性，用 embedding 保语义理解，再用 RRF 融合两路排名。对于知识库问答、代码搜索和 Agent memory，这通常比单一路径更稳。

## 31. RRF 的价值是什么？

参考答案：  
RRF 的价值是融合不同检索器的排名，而不要求它们分数尺度一致。BM25 分数和向量相似度不是同一个量纲，直接加权容易需要调参；RRF 只看名次，两边都靠前的结果会被提升。它简单、无需训练，适合作为 hybrid retrieval 的工程默认方案。

## 32. 你怎么评估 RAG 召回质量？

参考答案：  
不能只看 mean_score。要看 query 是否召回了支持答案的证据片段，top-k 内容是否覆盖关键事实，chunk 是否过大或过碎，metadata 是否正确，最终答案是否忠于上下文。可以结合人工标注、RAGAS 风格指标、golden query、召回命中率和答案引用追溯来评估。

## 33. 你怎么做 chunking 策略选择？

参考答案：  
我会按数据类型实验，而不是固定迷信语义分块。比如中文实验讲义里，语义分块可能块少块大，top-k 偏离问题；token 细切可能召回更局部、更贴题。评估时看节点数、top-k 总字数、召回片段质量、答案正确性，而不是只看相似度分数。

## 34. Talk-to-Sean 是怎么防幻觉的？

参考答案：  
Talk-to-Sean 用 LLM Wiki grounding。公开资料先进入 raw，再整理为 wiki 页面，运行时按固定顺序生成 deterministic context bundle，并把它作为 system prompt 中的唯一事实来源。Prompt 明确要求不能编造 Wiki 之外的时间线、指标、雇主、联系方式或私人信息。输出可以追溯到 raw、wiki 和最终 prompt。

## 35. Talk-to-Sean 为什么没有做复杂 RAG？

参考答案：  
当前个人主页知识规模小，事实边界固定，直接构建 deterministic context bundle 更简单、更可控。RAG 适合大规模、动态、多租户或检索成本明显的场景；如果资料量不大，全量注入反而减少检索漏召回和排序不稳定。后续知识库变大时，再引入检索和 hybrid search 更合理。

## 36. Talk-to-Sean 的技术栈是什么？

参考答案：  
它是 Next.js 15 App Router 应用，前端 React 19、TypeScript、Tailwind CSS、Framer Motion，聊天流式输出使用 Vercel AI SDK。服务端 `/api/chat` 调 OpenAI-compatible provider，支持 `OPENAI_MODEL` 和 `OPENAI_BASE_URL`。生产公开聊天用 Upstash Redis 或 Vercel KV 做持久配额保护。

## 37. Talk-to-Sean 的流式输出链路怎么走？

参考答案：  
前端 `/chat` 使用聊天 UI 向 `POST /api/chat` 发送消息。服务端用 Vercel AI SDK 调模型生成流，再转换成 HTTP 流式响应，前端逐步渲染。这样用户不用等完整回复结束，首字延迟更低。这个项目没有 runtime tools，所以 Vercel AI SDK 的轻量流式封装足够。

## 38. 公开 Chatbot 为什么要做限流和 fail-closed？

参考答案：  
公开聊天接口会消耗模型额度，也可能被滥用。Talk-to-Sean 在生产环境要求 Redis/KV 做持久配额，缺失时 `/api/chat` fail-closed；本地开发才允许内存计数。它还做总量、IP、匿名 session 多层限制，并拒绝陌生 Origin。这样可以避免 serverless 多实例下内存计数失效，也保护 API key 成本。

## 39. 为什么静态部署不适合完整 Talk-to-Sean？

参考答案：  
如果只展示个人主页，静态托管可以。但 `/api/chat` 是服务端路由，需要模型密钥、限流、Origin 校验和 Redis/KV 配额，静态导出无法运行这些逻辑。所以完整版本应该部署为 Next.js 服务端应用；国内静态入口和海外 chatbot 服务可以拆开，但不能指望 OSS/CDN 直接承载 `/api/chat`。

## 40. 你怎么处理生产和预览环境的模型成本？

参考答案：  
预览环境容易被分享，如果复用生产 key 和高额度，很容易烧成本。我会给 Preview 配独立低成本 key、较低 `DAILY_REQUEST_LIMIT` 和 `DAILY_IP_LIMIT`，生产 key 只放 Production。部署后用 `/api/health`、首页、`/chat` 首字响应、`/sitemap.xml` 和 dev config-check 做检查。

## 41. shotgunCV 的核心思路是什么？

参考答案：  
shotgunCV 不是单次“帮我改简历”的 prompt，而是把简历投递变成 pipeline：解析 JD、解析简历、生成候选版本、评分、排序、输出策略。它更像 workflow-first 的系统，因为流程稳定、步骤明确。模型在各节点做理解和生成，但控制权主要在工程代码里，这样更可测、更适合批量 JD 匹配。

## 42. PDF 简历解析你会怎么设计？

参考答案：  
我会文本优先，用 pypdf 直接抽取文本层；如果页面无文本或质量差，用 PyMuPDF 渲染成图片；再用 Tesseract OCR 补充；最后才用 vision model 兜底。评估不只看“有没有文本”，还要看结构质量和业务可用性，比如教育、工作、项目、技能等章节是否识别出来。

## 43. 为什么你强调 pipeline-first？

参考答案：  
因为业务流程一旦可以拆成确定步骤，就应该让工程代码承担流程控制，而不是让模型自由发挥。pipeline-first 的好处是每一步可以单测、记录中间产物、失败可重跑、指标可比较。模型适合在节点中做语义理解和生成，但不应该无边界地掌管整个业务状态。

## 44. 你怎么理解“可追踪”的 LLM 应用？

参考答案：  
可追踪意味着我能回答：输入是什么、用了哪些上下文、调用了哪些工具、模型输出了什么、为什么过滤、最终结果来自哪里。对 RAG 是 source/chunk 追溯；对 Agent 是 tool call 和 observation 追溯；对评测是 run_id、事件日志和指标追溯。没有追踪，就很难定位幻觉、误报和退化。

## 45. 你如何看待 prompt engineering？

参考答案：  
prompt 很重要，但它不是系统可靠性的全部。我的经验是，prompt 适合表达任务目标、行为边界和输出格式；真正的稳定性还要靠 schema、工具权限、协议约束、预算、日志和 eval。尤其在 submit 阶段，协议层强制通常比“请你必须提交”的文字更可靠。

## 46. 你怎么判断什么时候要拆成多 Agent？

参考答案：  
不是任务复杂就马上拆，而是看单 Agent 是否在职责、上下文、评测和故障定位上到达极限。可以独立评测、上下文能隔离、故障能定位、风险能下降、收益超过通信成本时，才值得拆。否则多 Agent 只会增加协调成本和状态同步问题。

## 47. 你怎么做安全隔离？

参考答案：  
我会分层做：模式隔离限制不同任务能用的工具；工具分级区分只读和执行类；路径隔离把文件访问限制在 workspace；命令白名单禁止任意 shell；环境变量清洗防止泄漏；必要时用 Docker 或沙箱做执行隔离。核心原则是不要相信模型会自觉安全，安全要由 runtime 强制。

## 48. 你怎么处理模型超时或失败？

参考答案：  
首先要区分失败类型：provider 协议错误、模型超时、schema 失败、工具失败、预算耗尽。不同失败不能一概重试。盲重试同一 prompt 往往只是重复浪费时间。更好的做法是记录错误体和上下文，改变策略后重试，比如收缩上下文、禁用 thinking、强制 submit，或者直接停止并返回可诊断状态。

## 49. 你觉得你相比普通“会用 AI API”的开发者优势在哪里？

参考答案：  
我的优势在于更关注工程闭环：模型接入只是第一步，我会继续做工具协议、结构化输出、上下文预算、评测样本、误报控制、部署保护和可观测性。换句话说，我不是只追求 demo 能跑，而是追求系统行为可以解释、可以复现、可以被 review，并且知道失败时从哪里查。

## 50. 如果合作人问“为什么选择你做 Agent / RAG 项目”，你怎么回答？

参考答案：  
我适合做这类项目，因为我同时关注产品目标和工程约束。Agent / RAG 项目最容易卡在“demo 好看但生产不稳”，而我会从一开始就设计事实来源、工具边界、schema、日志、eval、成本和部署策略。我能快速做原型，也能把原型推进到可追踪、可评测、可协作维护的系统。

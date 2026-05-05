# Interview Question Bank

The answers below are conservative answer directions for a public AI representative. They should not invent details absent from the wiki.

1. 请用 2 分钟介绍你自己，以及为什么定位 Agent / LLM Engineer。  
   答：我是 Sean Yu，MUC 2027 届计算机本科生，方向聚焦 Agent / LLM 应用工程。我主要用 Python、FastAPI、Pydantic、OpenAI API、tool calling 和 structured output 做可落地的 AI 应用。

2. 你为什么从普通后端/应用开发转向 LLM 和 Agent 方向？  
   答：公开资料显示 Sean 的后端基础和 LLM 应用方向结合紧密，可以强调他关注把模型能力通过服务、工具调用和工作流变成可验证的软件系统。

3. 你在 MUC 的 CS 课程中，哪些课程最直接支撑你的 LLM 应用开发？  
   答：数据结构、操作系统、计算机网络、数据库、软件工程和自然语言处理都能支撑 LLM 应用中的性能、服务化、数据建模和评估。

4. 你如何解释 shotgunCV 的业务问题和用户价值？  
   答：它面向高频求职投递，把 JD 解析、简历变体、评分排序和申请策略组织成 pipeline，帮助用户更系统地做批量申请决策。

5. shotgunCV 的整体 pipeline 如何拆分？  
   答：可按 JD parsing、resume variant generation、scoring/ranking、strategy output 拆分；更细实现细节 wiki 尚未包含。

6. JD parsing 如何保证结构化输出稳定？  
   答：可强调 schema、Pydantic 校验、structured output 和失败重试。不要声称已有具体线上指标。

7. 简历变体生成如何避免夸大或编造经历？  
   答：约束模型只能改写已存在事实，使用 schema 和规则校验，保留可追溯输入，不生成未提供经历。

8. 你如何设计 resume scoring / ranking 的评价标准？  
   答：可从 JD 匹配度、技能覆盖、项目相关性、表达清晰度和风险项解释。具体权重未在 wiki 中公开。

9. shotgunCV 中哪些步骤适合异步批处理？  
   答：JD 解析、多个简历变体生成、评分和策略输出都适合异步批处理，尤其是外部模型调用密集的步骤。

10. 如果 OpenAI API 限流或失败，shotgunCV 如何重试和降级？  
   答：可回答通用工程策略：指数退避、任务队列、错误记录、可重试状态和人工可读失败原因。具体实现细节未公开。

11. shotgunCV 如何记录 trace，方便复盘一次生成结果？  
   答：可强调输入 JD、prompt 版本、模型配置、结构化输出、评分理由和错误信息的端到端 trace。

12. Mergewarden 解决的核心 code review 痛点是什么？  
   答：它把 diff 和 failure signal 转换成分级 review findings 和可验证 debugging steps，降低排查和审查成本。

13. Mergewarden 如何解析 diff 和 CI failure signal？  
   答：wiki 只说明它处理 diffs 和 failure signals；具体解析策略未公开。可从文件变更、错误日志和测试失败信号高层解释。

14. LLM 生成 review finding 时如何控制严重级别？  
   答：可使用明确分级 rubric、证据字段、文件定位、置信度和人工复核边界。

15. Mergewarden 如何把“调试建议”变成可验证步骤？  
   答：要求输出具体命令、预期结果和失败时的下一步，而不是泛泛建议。

16. Mergewarden 如何集成 GitHub Actions？  
   答：公开资料只说明 CI integration。可保守描述为读取 CI 失败信号并在流水线或本地流程中生成审查/调试结果。

17. 你如何设计一个面向团队的 LLM code review 安全边界？  
   答：限制为建议而非自动合并，保留证据、置信度、人工确认和敏感信息过滤。

18. 你如何理解 “eval first, scale second”？  
   答：先建立可复现评估和端到端 trace，再扩大功能和规模，避免凭直觉判断 LLM 应用质量。

19. 你会如何为 Agent 系统设计 reproducible eval？  
   答：固定任务集、输入、工具 schema、期望结果、评分 rubric 和 trace，比较多次运行的一致性。

20. RAGAS-style eval 适合评估什么，不适合评估什么？  
   答：适合检索和生成链路的相关性、忠实度等评估；不应替代业务成功指标或人工审查。

21. structured output 相比自然语言输出有什么工程优势？  
   答：便于校验、存储、重试、组合流程和下游自动化。

22. Pydantic 在 LLM 应用里解决了哪些问题？  
   答：schema 定义、类型校验、错误定位和输入输出契约管理。

23. tool calling 的输入输出 schema 应该如何设计？  
   答：小而明确，字段可验证，错误可恢复，避免让模型自由构造不受控参数。

24. Agent workflow 中如何避免无限循环？  
   答：设置 step limit、状态机、终止条件、工具调用预算和失败回退。

25. 什么时候使用 LangChain，什么时候直接调用模型 SDK？  
   答：复杂编排或生态组件需要时可用 LangChain；简单、可控的生产路径可直接 SDK。

26. 如何处理 prompt injection？  
   答：分离系统指令和用户输入，限制工具权限，校验输出，拒绝覆盖边界规则。

27. 如何验证 LLM 输出没有违反业务规则？  
   答：使用 schema、规则校验、测试样例、人工审查和 trace 复盘。

28. FastAPI 服务中如何组织 route、service、schema 层？  
   答：route 处理 HTTP，service 处理业务流程，schema 定义输入输出契约。

29. async I/O 在 LLM API 调用场景中有哪些坑？  
   答：并发限流、超时、取消、重试风暴和错误传播。

30. MySQL 适合存哪些 LLM 应用数据？  
   答：用户任务、结构化结果、配置、审计记录和状态机数据。

31. Redis 在 Agent / batch pipeline 中可以承担什么角色？  
   答：缓存、限流、短期状态、队列辅助和幂等控制。

32. 你如何设计日志和错误处理，方便定位线上问题？  
   答：记录 request id、模型配置、阶段、错误类型、耗时和可脱敏输入输出摘要。

33. pytest 如何覆盖 LLM 应用中不可稳定复现的行为？  
   答：测试确定性解析、schema、边界和评估函数；模型输出用固定样例或契约测试。

34. Docker 化部署时你关注哪些镜像和运行时问题？  
   答：镜像体积、环境变量、启动命令、健康检查、日志和依赖锁定。

35. GitHub Actions 中如何区分 lint、typecheck、test、build 阶段？  
   答：按失败成本和反馈速度分层，先静态检查和测试，再构建。

36. 如果一个 LLM 应用成本突然升高，你如何排查？  
   答：看请求量、token、重试、模型配置、长上下文和异常循环。

37. embeddings、hybrid retrieval、rerankers 各自解决什么问题？  
   答：embedding 做语义召回，hybrid retrieval 结合关键词和语义，reranker 重新排序候选结果。

38. 为什么本项目采用 LLM Wiki pattern 而不是 RAG？  
   答：资料规模小且需要强审计，wiki context 更确定、可维护，也避免 query-time 检索不稳定。

39. LLM Wiki 的 raw、wiki、schema 三层分别负责什么？  
   答：raw 保存来源，wiki 编译可回答知识，schema 约束维护和运行时上下文规则。

40. 如何防止 LLM Wiki 长期维护中出现事实漂移？  
   答：变更先入 raw，再更新 wiki 和 log，定期检查矛盾、过期事实和无来源断言。

41. 你如何做开源协作中的 issue、PR、code review？  
   答：公开资料显示 Sean 熟悉 PR、issues 和 code review。可强调小步提交、清晰复现和可验证修改。

42. 远程协作中你如何同步进度和风险？  
   答：用明确交付物、状态更新、阻塞项和下一步计划同步。

43. 英语沟通中你如何解释复杂技术方案？  
   答：Sean 公开英语水平为 IELTS 7.0 和 CET-6，可用结构化表达解释目标、约束、方案和风险。

44. 作为 2027 届本科生，你和有工作经验候选人的差异化优势是什么？  
   答：可强调学习速度、工程基础、LLM 应用聚焦和从项目中快速迭代。不要夸大工作年限。

45. 如果面试官质疑项目 star 数或用户量较少，你如何回应？  
   答：承认规模事实，用问题定义、架构、评估、trace 和可复现工程质量证明项目价值。

46. 你如何从 0 到 1 推进一个 LLM 产品原型？  
   答：先定义用户问题和评价标准，再做最小 pipeline、结构化输出、日志和失败案例复盘。

47. 你如何判断一个功能应该自己实现还是调用第三方服务？  
   答：看核心差异化、可靠性、成本、维护负担和数据边界。

48. 你经历过的最典型工程失败或不确定点是什么，以及如何复盘？  
   答：wiki 没有个人失败案例细节。可保守回答 Sean 倾向用 trace、测试和复盘记录定位问题。

49. 你希望加入大厂/外企后承担什么类型的工作？  
   答：公开定位是 Agent / LLM roles，可表达希望参与 LLM 应用、Agent workflow、评估和后端服务化相关工作。

50. 如果团队要求你维护长期演进的 Agent 系统，你会先建立哪些工程规范？  
   答：schema、eval、trace、工具权限、错误处理、测试、部署流程和文档规范。

# Fuction Calling

## 主循环最大轮数

在 AI Agent 架构中，限制最大轮数（Max Iterations / Max Turns）是防止 Agent 陷入“思考死循环”和“Token 费用暴涨”的兜底机制。
在业务落地时，最大轮数不应该是一个凭空猜测的数字，而应该根据 任务复杂度、业务容错率、成本预算 以及 交互形态 综合评估。
以下是根据不同业务场景调整 Agent 最大轮数的实战指南：

一、 常见业务场景的轮数推荐设置

1. 简单信息路由/问答：查询天气、查单个数据库、单次意图分类，2 ~ 3 轮，标准“单轮完成”场景。1轮提问+工具调用，1轮总结回复。如果超过3轮说明 AI 迷路了，应果断报错或转人工。
2. 标准自动化办公/轻Agent：提取发票信息并写入 Excel、跨系统单条数据同步，4 ~ 6 轮，容错性高的线性任务。允许 AI 经历 1-2 次由于工具输入错误（如日期格式不对）引起的自我纠错（Self-Correction）。
3. 复杂推理与数据分析：根据用户需求生成财务报表并分析趋势、编写复杂脚本并运行测试，8 ~ 12 轮，多步骤组合任务。AI 需要依次“读数据 -> 清洗 -> 思考 -> 写代码 -> 运行报错 -> 修复 -> 输出”，需要留够足够的轮数让其完成链路。
4. 软件工程自主Agent：Cline / Roo Code、自动修复 Bug 智能体，15 ~ 30 轮，探索型任务。涉及大量文件读写、编译、报错定位。上限设得高，但通常需要配合人工每步确认（Human-in-the-loop）。

二、 动态调整最大轮数的 4 个业务核心维度

1. 成本与预算限制（Cost & Budget）
   大模型的计费是按 Token 累计的。在 Agent 循环中，每一次新轮次都会把之前所有轮次的聊天历史（Context）重新发送给大模型。

- 计算公式：消耗呈等差/等比数列级数增长。
- 业务调整：如果是高并发的商业应用（如 C 端客服、ToB 场景下的高频自动化），建议将轮数压在 3~5 轮 以内。同时在代码里加上 Max_Cost_Limit（单次任务消费超过 $0.5 自动熔断）。

2. 实时性要求（Latency / SLA）

- 同步阻塞（User-facing）：如果用户在网页前端转圈等待结果，最大轮数必须控制在 3 轮 以内，否则大模型多次思考的延迟（可能长达 30 秒甚至 1 分钟）会导致极差的用户体验。
- 异步后台（Background Job）：如果是定时任务、跑批处理（如半夜自动生成行业分析报告），可以将轮数放宽到 10~15 轮，更看重最终任务的完成质量。

3. 工具（Tools）的丰富度与确定性

- 如果你给 Agent 塞了 20 个功能各异的工具，它挑错工具、参数传错的概率会大幅上升，需要更多的轮数来“纠错”。
- 业务优化：与其盲目调大最大轮数，不如精简单个 Agent 的工具箱。通过 Router（路由 Agent）把大任务拆分给多个专职的子 Agent（每个子 Agent 只有 2-3 个工具，Max_Iterations 设为 3）。

三、 生产环境的“优雅熔断”机制

在代码实现中，不要在达到 Max_Iterations 时直接抛出崩溃异常（Crash），这会导致糟糕的用户体验。应当引入优雅降级（Graceful Degradation）：

1. 倒数第二轮预警：当 current_step == max_iterations - 1 时，在 System Prompt 里动态注入一句强力警告：“这是你最后一次机会，请立即根据当前已有数据整理出最终答案，不要再调用任何工具。”
2. 达到上限时输出“半成品”：如果真的达到了最大轮数，让代码截断循环，并要求大模型（或者用一段硬编码提示）：“根据目前你已经拿到的步骤和日志，总结一个当前阶段的进展报告给用户。”
3. 触发兜底通路：自动触发转接人工客服、或者发送一条告警（钉钉/企业微信机器人）给开发人员协助排查。

## 声明给大模型的工具描述 (Tools Schema)

写好工具描述，可以总结为 “名字要专、描述要满、限制要严、示例要看” 十六字诀。以下是提升 AI 工具调用准确率的深度实战指南：

一、 💡 核心黄金法则

1. 名字要专（Function Name）
   函数名是 AI 检索工具的第一线。

- 错误做法：使用模糊或通用的名字，如 run_process、get_data、handle_user。
- 正确做法：遵循 “动词+名词” 结构，且足够具体，如 fetch_user_order_history、calculate_mortgage_loan。

2. 描述要满（Function Description）
   大模型在触发工具前，会计算用户意图与工具 description 的语义匹配度。

- 错误做法：只写功能，不写前置条件。如：“查询天气”。
- 正确做法：写明功能、适用场景、以及大模型何时不应该调用它。示例：“用于查询特定城市未来 1-7 天的实时天气、温度和降水概率。当用户询问‘今天穿什么’、‘周末适合去哪玩’时，应先调用此工具获取天气背景。”

3. 限制要严（Parameter Type & Enum）
   只要有固定选项，就必须使用 enum 限制，否则大模型会根据自己的语料库胡乱发明参数。

- 错误做法：允许大模型随意传入代表时间的字符串。
- 正确做法：限定输入格式。

```json
"time_range": {
    "type": "string",
    "enum": ["today", "yesterday", "last_7_days", "current_month"],
    "description": "查询的时间范围限制，默认值为 today"
}
```

4. 示例要看（Parameter Description）
   在参数的 description 里，不仅要写参数是什么，最好带上期望的格式示例。

- 错误做法：

```json
"user_id": { "type": "string", "description": "用户的ID" }
```

- 正确做法：

```json
"user_id": { "type": "string", "description": "系统用户的唯一标识符，必须以大写字母U开头，后跟5位数字。例如：'U10842'" }
```

二、 避坑：大模型最容易犯的 3 个“低级错误”

在工具描述不完美时，生产环境中极易遇到以下三种翻车现场：

1. “幻觉传参”：大模型会把用户的随口一句话当成参数。比如用户说：“帮我查查小明的余额，他好像很有钱。” 如果你没在 description 里强调“必须传入结构化 ID”，大模型会直接把 "xming" 甚至 "小明" 当作 user_id 传给你。
2. “工具滥用”：如果两个工具的描述太接近（如 get_user_profile 和 get_user_detail），大模型会陷入纠结，甚至在单次交互中把两个工具都调用一遍，导致性能和成本翻倍。
3. “日期格式混乱”：如果没有声明，大模型传日期一会儿给 "2026/11/02"，一会儿给 "2026-11-02"，甚至给 "今天"。必须在描述中强制指定格式（如 “必须采用 YYYY-MM-DD 格式”）。

三、 生产级对比：平庸 vs 卓越的工具定义

假设我们要写一个“给客户发送封锁通知邮件”的工具，我们来看看两者的代差：

容易翻车的平庸写法：

```json
json
{
    "name": "send_email",
    "description": "发送一封邮件给用户",
    "parameters": {
        "type": "object",
        "properties": {
            "email": {"type": "string"},
            "reason": {"type": "string"}
        },
        "required": ["email", "reason"]
    }
}
```

问题所在：大模型不知道这封邮件是干嘛的（通知？营销？警告？）；不知道 reason 该写一句大白话还是写标准的处罚条例，极易写出不符合业务规范的垃圾邮件。

极度精准的卓越写法

```json
{
  "name": "notify_user_account_suspension",
  "description": "当且仅当由于合规、违规或欠费等原因需要对用户的账户进行风控封锁（Suspension）时，调用此工具向用户发送官方邮件通知。切勿用于日常营销或普通验证码发送。",
  "parameters": {
    "type": "object",
    "properties": {
      "user_email": {
        "type": "string",
        "description": "接收通知的用户邮箱地址，需进行标准的Email格式校验。例如：'compliance@company.com'"
      },
      "violation_type": {
        "type": "string",
        "enum": ["overdue_payment", "terms_violation", "suspected_hacking"],
        "description": "封锁账户的合规原因类型。overdue_payment:欠费，terms_violation:违反服务条款，suspected_hacking:遭遇黑客攻击风险"
      },
      "ticket_id": {
        "type": "string",
        "description": "关联的内部工单流水号，必须以'TK-'开头。如果用户没有提供，AI应当在调用工具前先向用户询问该工单号。"
      }
    },
    "required": ["user_email", "violation_type", "ticket_id"]
  }
}
```

让大模型完全明白了工具边界（不用于营销）；通过 enum 锁死了违规类型；通过 ticket_id 的描述，大模型知道如果用户没给工单号，它得先反问用户而不是带空参数调用。

四、 提效建议

如果你的工具矩阵非常庞大（超过 10 个工具），建议引入 Prompt Compiler（提示词编译器） 思想：
在把 Schema 喂给大模型前，可以专门写一个 Prompt 让 Claude 3.5 Sonnet 或 GPT-4o 帮你 review 你的 Schema：
“我写了一个 Python 函数，这是它的签名和入参。请帮我生成一份给 OpenAI Tool Calling 使用的、最不容易产生歧义和幻觉的 JSON Schema 描述。”
如果你正在为某个具体的业务逻辑写工具描述，可以把你的函数目的和参数列表发出来，我们一起来现场重构一份符合最高准确率标准的 Schema。

## Agent 主循环核心逻辑

写好 Function Calling 中的 Agent 主循环核心逻辑，本质上是写一个高鲁棒性的“状态机”。大模型只负责“思考和吐出 JSON 决策”，而你的 Python 主循环代码则负责“死磕执行、拦截错误和控制成本”。
在生产环境中，一个合格的 Agent 主循环必须具备状态完整、防死循环、容错兜底、多工具并发四大核心能力。
以下是编写卓越 Agent 主循环的核心逻辑框架与实战避坑指南：

一、 核心状态逻辑：六步黄金链路

在编写 while 循环时，每一轮循环（Iteration）都必须严密地执行以下六个步骤：
[1. 检查轮数上限] ──> [2. 请求大模型] ──> [3. 拦截/解析异常]
┌─────────────────────────────────────────────┘
▼
[4. 检查是否结束?] ──(No: 有工具请求)──> [5. 执行本地函数] ──> [6. 结果喂回上下文] ──(回到步骤1)
│
(Yes: 无工具请求)
│
▼
[最终文本输出]

二、 生产级主循环代码骨架（关键逻辑详解）

结合实际业务，以下是最高效、最稳固的 Python 主循环写法：

```python
import json
from openai import OpenAI
from openai.types.chat import ChatCompletionMessageFunctionToolCall

client = OpenAI()

def run_agent_main_loop(user_query: str, max_iterations: int = 5):
    # 1. 初始化上下文（整个生命周期的记忆链条）
    messages = [
        {"role": "system", "content": "你的系统提示词..."},
        {"role": "user", "content": user_query}
    ]

    current_step = 0

    # 2. 进入主循环
    while current_step < max_iterations:
        current_step += 1

        # 【核心逻辑 1：临近上限的强力收敛机制】
        if current_step == max_iterations:
            messages.append({
                "role": "system",
                "content": "警告：这是最后一轮机会！禁止调用任何工具。请根据现有数据，立即给出最终结论！"
            })

        try:
            # 3. 发送请求给大模型
            response = client.chat.completions.create(
                model="gpt-4o-mini", # 或 deepseek-chat
                messages=messages,
                tools=my_tools_schema,
                tool_choice="auto"
            )
        except Exception as api_err:
            # 【核心逻辑 2：LLM API 异常兜底】
            return f"系统繁忙，大模型连接失败: {str(api_err)}"

        response_message = response.choices.message
        tool_calls = response_message.tool_calls

        # 【核心逻辑 3：必须立刻将大模型的响应压入上下文】
        # 即使包含 tool_calls，大模型的这条消息也是记忆链里不可或缺的一环，否则下一轮会报“tool_call_id 找不到”的格式错误
        messages.append(response_message)

        # 4. 判断是否结束（出口条件）
        if not tool_calls:
            # 大模型认为不需要再查数据了，吐出最终文本
            return response_message.content

        # 5. 处理工具调用（大模型单轮可能发出多个工具请求）
        print(f"AI 在第 {current_step} 轮决定调用 {len(tool_calls)} 个工具...")

        for tool_call in tool_calls:
            if not isinstance(tool_call, ChatCompletionMessageFunctionToolCall):
                continue

            tool_id = tool_call.id
            func_name = tool_call.function.name
            func_args_str = tool_call.function.arguments

            # 【核心逻辑 4：安全的参数解析与本地执行】
            try:
                args = json.loads(func_args_str)
                # 寻找并执行本地函数
                if func_name in tools_map:
                    tool_result = tools_map[func_name](**args)
                else:
                    tool_result = {"status": "error", "message": f"工具 {func_name} 未定义"}
            except json.JSONDecodeError:
                tool_result = {"status": "error", "message": "大模型生成的参数非合法 JSON 格式"}
            except Exception as e:
                tool_result = {"status": "error", "message": f"本地工具执行发生崩溃: {str(e)}"}

            # 【核心逻辑 5：成对反馈给大模型（role='tool'）】
            # 必须带上对应的 tool_call_id，content 必须转换为字符串（通常是 JSON 字符串）
            messages.append({
                "role": "tool",
                "tool_call_id": tool_id,
                "name": func_name,
                "content": json.dumps(tool_result, ensure_ascii=False)
            })

    # 6. 【核心逻辑 6：循环耗尽（死循环熔断）】
    return "任务处理超时，系统未能成功收敛结果，请稍后重试或联系人工客服。"
```

三、 写好主循环的 4 个致命避坑点（高频翻车现场）

翻车点 1：遗漏压入大模型的 assistant 消息

很多新手在发现 tool_calls 存在时，直接去执行本地函数，然后只把 role: tool 的结果压进 messages，忘记了把大模型包含 tool_calls 的那条 assistant 消息也压进去。

- 后果：大模型 API 会直接报错抛出异常（类似 Invalid parameter: messages: ...），因为在 OpenAI 的规范中，role: tool 消息前面，必须紧跟一条带有相同 tool_call_id 的 assistant 消息。

翻车点 2：忽略了“平行工具调用（Parallel Tool Calls）”

大模型非常聪明，如果用户问：“帮我查查北京和上海的天气”，它会在同一轮交互中同时丢出两个工具请求（北京天气、上海天气）。

- 主循环要求：你的代码必须使用 for tool_call in tool_calls: 循环去遍历并执行所有被请求的工具。如果你只处理第一个（tool_calls[0]），下一轮发送给大模型时，大模型会因为其中一个 tool_call_id 没有得到反馈而拒绝回答。

翻车点 3：工具报错时直接在 Python 里 raise

如果你的本地函数（比如查数据库）因为断网或者查无此人报错了，直接在 Python 里抛出异常（raise Exception）会导致整个主循环断开、用户网页直接报错。

- 高效做法：将错误拦截（try...except），包装成 JSON 字符串返回给大模型（如上文代码所示）。大模型极其擅长读取错误日志，它看到报错后通常会自我修正参数重新尝试，或者用非常人性化的语言向用户致歉，让系统具备自我愈合能力。

翻车点 4：没有上下文裁剪导致 Token 暴涨

随着主循环轮数增加（比如到了第 4 轮），messages 数组里已经包含了：[System, User, Assistant(Tool Call), Tool Result, Assistant(Tool Call 2), Tool Result 2...]。

- 高并发优化：每一次进 while 循环，大模型计费都是把这长串历史全部重新计费一次。如果你的工具返回的数据非常庞大（比如抓取了整个网页），建议在把工具结果丢回 messages 前，用 Python 代码强制做一次文本截断或清洗，只保留核心关键字段，防止 Token 产生等差级数暴涨。
  你的 Agent 在实际业务中，单次任务大概需要同时调用多少个工具？如果涉及到需要前后依赖的复杂多工序调用（比如工具 A 的输出是工具 B 的输入），我们可以进一步聊聊如何在循环中加入更高级的“记忆修剪”和“显式链路追踪”。

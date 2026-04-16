---
title: "Quiz for Mechanism Design"
subtitle: ""
date: "2026-01-19"
tags: ["Mechanism Design"]
---

#### 1. Problem Statement

Consider that a crowdsourcing platform needs multiple computing devices to complete a microtask (e.g., labeling images). Each device has a private cost per task (depending on skill/effort) and can produce output of a certain quality. The platform must assign tasks and decide payments to ensure high-quality results. Please formulate this as a mechanism design problem. You do not need to solve the mechanism or prove properties, but only model it mathematically (using notations defined by yourselves). **Instructions:**

1\. Define the set of computing devices and their corresponding types;

2\. Specify the decisions;

3\. Indicate the utility function of each computing device (assuming that it is quasi-linear);

4\. Formulate the objective function (either social welfare or revenue maximization);

5\. Write the full optimization problem (including decision variables, objective, constraints).

#### 2. 众包平台任务分配与支付机制建模（Reverse Auction）

在信息不对称（设备成本和质量为私有信息）条件下，设计满足激励相容与个体理性的分配与支付规则。

* 平台：Quality-Cost Pareto Efficiency
* 设备：Incentive-Compatible Profit Maximization

设计算设备集合为 $\mathbf{N}=\{1,2,\cdots,N\}$，每个设备 $i$ 的类型为 $\theta_i=(c_i,q_i)$，其中 $c_i$ 为成本，$q_i$ 为质量。

**平台决策：**

* 任务分配 $x_i \in \{0,1\}$（1表示分配任务，0表示不分配任务）
* 支付 $p_i$

任务分配决策向量化表示为 $\mathbf{x}=\{x_1,x_2,\cdots,x_N\}^T$，支付决策向量化表示为 $\mathbf{p}=\{p_1,p_2,\cdots,p_N\}^T$。

**效用函数：**

* 设备 $i$ 的效用：$u_i = p_i - c_i x_i$
* 平台的收益：$u_p = \sum_{i \in \mathbf{N}} q_i x_i - p_i$

**目标函数：**

* 最大化平台收益：$\max_{\mathbf{x},\mathbf{p}} u_p = \max_{\mathbf{x},\mathbf{p}} \sum_{i \in \mathbf{N}} q_i x_i - p_i$

* 最大化社会福利：$\max_{\mathbf{x},\mathbf{p}} (u_p + \sum_{i \in \mathbf{N}} u_i) = \max_{\mathbf{x},\mathbf{p}} \sum_{i \in \mathbf{N}} q_i x_i - c_i x_i$

**约束条件：**

1\. IC（Incentive Compatibility，真实申报成本 $c_i$ 和质量 $q_i$）：$u_i(c_i, q_i, c_{-i}, q_{-i}) \geq u_i(c_i', q_i', c_{-i}, q_{-i}), \forall i \in \mathbf{N}$

2\. IR（Individual Rationality，设备参与效用非负）：$p_i - c_i x_i \geq 0, \forall i \in \mathbf{N}$

3\. 任务数量约束（至少 $k$ 个设备被分配任务）：$\sum_{i \in \mathbf{N}} x_i \geq k$

4\. 二元变量约束：$x_i \in \{0, 1\}, \forall i \in \mathbf{N}$

> [Note] 和正向拍卖的关联：
> 
> 将申报成本和质量记为 $b_i$，真实成本和质量记为 $c_i$；就对应了正向拍卖中的竞价 $b_i$ 和真实估值 $v_i$。
# 15-Min Demo Script (Sell to Pilot Clients)

## 0-2 分鐘：痛點對齊
- 你而家有冇「報價後失蹤」？
- 有冇漏跟進？
- 平均幾耐先覆到客？

## 2-6 分鐘：Live flow
1. 開 `/lead/new` 新增一個客
2. 去 `/lead/:id` 補充資料
3. 去 `/quote/:id` 建立 line items quote
4. 開 `/followups` 建立 D+1 跟進

## 6-10 分鐘：成果畫面
- `/dashboard` 睇 KPI
- `/quotes` 睇報價歷史
- `/followups` 睇待辦與逾期項目

## 10-13 分鐘：自動化亮點
- 觸發 `POST /api/followups/auto`
- 示範 quoted leads 自動建立跟進

## 13-15 分鐘：收單
- Offer：7日 Pilot
- KPI：回覆率、預約率、跟進完成率
- CTA：今日開通，明日開始追蹤數字

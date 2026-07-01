import { Router } from "express";
import { chat } from "../services/chat";

const router = Router();

// 发送消息
router.post("/message", (req, res) => {
  const { message, categoryId, deviceId } = req.body || {};
  if (!message || typeof message !== "string") {
    res.status(400).json({ success: false, error: "消息内容为必填" });
    return;
  }
  const response = chat(
    message,
    typeof categoryId === "string" ? categoryId : undefined,
    typeof deviceId === "string" ? deviceId : undefined,
  );
  res.json({ success: true, data: response });
});

export default router;

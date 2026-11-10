 # 🛠️ تقرير فني لمطور الـ Backend: حل مشكلة استيثاق جلسات Jitsi Meet

تم إعداد هذا التقرير لتوضيح سبب ظهور رسالة **"فشلت عملية الاستيثاق: عذراً، لا يُسمح لك بالانضمام إلى هذه المكالمة"** وخطوات حلها من جهة الـ Backend وسيرفر Jitsi.

---

## 🛑 1. وصف المشكلة (Issue Description)

عند قيام المعلم أو الطالب بالانضمام إلى الحصة عبر استدعاء المسار:
```http
POST /schedules/:id/join
```
يقوم الـ Frontend باستلام بيانات الـ Jitsi بنجاح (`token`, `roomName`, `domain`, `url`) وتمريرها لمكتبة `@jitsi/react-sdk`. 

تفتح شاشة الحصة، ولكن بعد ثوانٍ تظهر نافذة حمراء داخل Jitsi بالرسالة التالية:
> **"فشلت عملية الاستيثاق: عذراً، لا يُسمح لك بالانضمام إلى هذه المكالمة"**

### 📋 سجلات الخطأ من الـ Browser Console:

```text
[INFO] [app:connection] Using service URL wss://meet.bayt-alquran.net/xmpp-websocket
[INFO] [xmpp:Xmpp] <Lu.connectionHandler>: (TIME) Strophe connecting
[INFO] [xmpp:Xmpp] <Lu.connectionHandler>: (TIME) Strophe authfail
[ERROR] [app:base-conference] JWT error: Invalid signature
[ERROR] [xmpp:Xmpp] <Lu.connectionHandler>: XMPP connection dropped!
```

---

## 🔍 2. السبب الجذري للخطأ (Root Cause)

خطأ **`JWT error: Invalid signature`** و **`Strophe authfail`** يعني أن خادم Jitsi (برنامج Prosody المسؤول عن الـ XMPP) استلم التوكن ولكنه **فشل في التحقق من صحة التوقيع (Signature Verification)**.

### الأسباب المحتملة:
1. **المفتاح السري (Secret Key) غير متطابق:** المفتاح السري المستخدم في كود الـ Backend لتوقيع الـ JWT عبر `jwt.sign(payload, SECRET)` يختلف عن قيمة `app_secret` (أو `JWT_APP_SECRET`) المحددة في إعدادات خادم Jitsi/Prosody.
2. **الـ Issuer (`iss`) غير متطابق:** القيمة المرسلة في `iss` (مثلاً `"bayt-alquran"`) تختلف عن قيمة `app_id` (أو `JWT_APP_ID`) في إعدادات سيرفر Prosody.
3. **خوارزمية التشفير (Algorithm):** استخدام خوارزمية تختلف عما يتوقعه Prosody (المتوقع الافتراضي هو `HS256`).

---

## ✅ 3. خطوات الحل المطلوبة في الـ Backend وسيرفر Jitsi

### أولاً: التحقق من إعدادات سيرفر Jitsi (Prosody Config)

في ملف إعدادات Prosody على سيرفر `meet.bayt-alquran.net` (عادة في `/etc/prosody/conf.d/meet.bayt-alquran.net.cfg.lua` أو عبر متغيرات الـ Docker Compose):

```lua
VirtualHost "meet.bayt-alquran.net"
    authentication = "token"
    app_id = "bayt-alquran"              -- يجب أن يطابق iss في التوكن
    app_secret = "YOUR_SUPER_SECRET_KEY" -- هذا هو المفتاح السري المطلوب
```

> **ملاحظة إذا كنتم تستخدمون Docker:** تأكد من قيم المتغيرات في ملف `.env` الخاص بـ Jitsi Docker:
> - `JWT_APP_ID=bayt-alquran`
> - `JWT_APP_SECRET=YOUR_SUPER_SECRET_KEY`

---

### ثانياً: التأكد من كود إنشاء التوكن في الـ Backend (Node.js Example)

تأكد من أن دالة توليد توكن الجلسة في الـ Backend تستخدم نفس الـ `app_secret` و `app_id` تماماً:

```javascript
const jwt = require('jsonwebtoken');

function generateJitsiToken({ user, roomName, isModerator }) {
  // 1. المفتاح السري المتطابق تماماً مع سيرفر Jitsi
  const JITSI_APP_SECRET = process.env.JITSI_APP_SECRET; // تأكد أنه نفس app_secret في Prosody
  const JITSI_APP_ID = process.env.JITSI_APP_ID || "bayt-alquran";

  const payload = {
    aud: "jitsi",
    iss: JITSI_APP_ID,
    sub: "meet.bayt-alquran.net", // أو "*"
    room: roomName,               // نفس اسم الغرفة بدون مسافات أو رموز خاصة
    nbf: Math.floor(Date.now() / 1000) - 10,
    exp: Math.floor(Date.now() / 1000) + (3 * 60 * 60), // صلاحية 3 ساعات
    context: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        moderator: isModerator, // true للمعلم، false للطالب
        affiliation: isModerator ? "owner" : "member"
      },
      features: {
        recording: isModerator ? "true" : "false",
        livestreaming: "false",
        "screen-sharing": "true"
      }
    }
  };

  // 2. التوقيع باستخدام خوارزمية HS256
  return jwt.sign(payload, JITSI_APP_SECRET, { algorithm: "HS256" });
}
```

---

## 🛑 4. مسار إنهاء الجلسة غير موجود على السيرفر (`Cannot POST /schedules/:id/end`)

حسب ملف التوثيق المرفق سابقاً (`FRONTEND_SESSION_INTEGRATION.md` - قسم "إنهاء الجلسة End Session"):
- عند قيام المعلم بإنهاء الحصة واستدعاء المسار:
  ```http
  POST https://api.bayt-alquran.net/schedules/:id/end
  ```
- يرد سيرفر الباك إند بخطأ `404 Not Found` بتنسيق HTML من Express:
  ```html
  <!DOCTYPE html>
  <html lang="en">
  <head>
  <meta charset="utf-8">
  <title>Error</title>
  </head>
  <body>
  <pre>Cannot POST /schedules/c2c2f390-8e05-41ff-adde-b9bfa0816b6d/end</pre>
  </body>
  </html>
  ```

### 🔍 السبب والحل المطلوب:
- رسالة `Cannot POST /schedules/:id/end` تدل على أن الـ Route غير معرّف أو غير مسجل في Express Router الخاص بـ `schedules` على السيرفر الحي.
- أو تم تسميته بشكل مختلف في كود الباك إند (يرجى توضيح الاسم الصحيح إن وُجد).
- **المطلوب:** التأكد من إضافة وتسجيل الـ Route في راوتر الـ `schedules`:
  ```javascript
  // schedules.routes.js
  router.post('/:id/end', authMiddleware, schedulesController.endSession);
  ```
  ليقوم بتحديث حالة الحصة إلى `completed` واحتساب مستحقات المعلم وإرسال الإشعارات.

---

### ملخص الخطوات السريعة للتنفيذ:
1. مطابقة `JITSI_APP_SECRET` في كود الـ Backend مع `app_secret` في سيرفر `meet.bayt-alquran.net`.
2. مطابقة `iss` في التوكن مع `app_id` في السيرفر.
3. تفعيل وتسجيل مسار إنهاء الجلسة `POST /schedules/:id/end`.

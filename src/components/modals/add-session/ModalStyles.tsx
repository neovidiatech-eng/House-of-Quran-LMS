export default function ModalStyles() {
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
          .label {
            display:flex;
            align-items:center;
            gap:8px;
            font-size:11px;
            font-weight:700;
            color:#94a3b8;
            margin-bottom:8px;
            text-transform:uppercase;
            letter-spacing:.08em;
          }

          .input {
            width:100%;
            padding:12px 16px;
            border-radius:18px;
            background:#f8fafc;
            border:1px solid transparent;
            font-size:14px;
            font-weight:600;
            outline:none;
          }

          .textarea {
            width:100%;
            min-height:100px;
            padding:14px 16px;
            border-radius:18px;
            background:#f8fafc;
            border:1px solid transparent;
            resize:none;
            outline:none;
          }

          .input:focus,
          .textarea:focus {
            border-color:#c7d2fe;
            background:white;
          }

          .error-text {
            font-size:11px;
            color:#ef4444;
            margin-top:4px;
            margin-left:4px;
            font-weight:700;
          }

          .toggle-btn {
            flex:1;
            padding:10px;
            border-radius:14px;
            font-size:13px;
            font-weight:700;
            transition:.2s;
          }

          .active-toggle {
            background:white;
            color:#4f46e5;
            box-shadow:0 1px 3px rgba(0,0,0,.08);
          }

          .card-box {
            padding:24px;
            border-radius:28px;
            background:#f8fafc;
            margin-bottom:24px;
          }

          .day-btn {
            padding:10px 14px;
            border-radius:14px;
            border:1px solid #e5e7eb;
            font-size:12px;
            font-weight:700;
            transition:.2s;
          }

          .platform-btn {
            display:flex;
            align-items:center;
            justify-content:center;
            gap:8px;
            padding:14px;
            border-radius:18px;
            border:2px solid #e5e7eb;
            font-weight:700;
            transition:.2s;
          }

          .active-platform {
            background:#111827;
            color:white;
            border-color:#111827;
          }

          .primary-btn {
            background:#4f46e5;
            color:white;
            padding:12px 24px;
            border-radius:18px;
            font-weight:700;
          }

          .secondary-btn {
            background:#f3f4f6;
            color:#374151;
            padding:12px 24px;
            border-radius:18px;
            font-weight:700;
          }

          .custom-scrollbar::-webkit-scrollbar {
            width:5px;
          }

          .custom-scrollbar::-webkit-scrollbar-thumb {
            background:#cbd5e1;
            border-radius:999px;
          }
        `,
      }}
    />
  );
}

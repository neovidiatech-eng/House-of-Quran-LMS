import {
  ArrowRight,
  Download,
  FileText,
  Image,
  File,
  BookOpen,
  Tag,
} from "lucide-react";

import { CourseItem } from "../../../types/course";
import { AttachedFile } from "../../../types/lmsCourses";
import { getYoutubeThumbnail } from "../../../features/admin/pages/LMSCourses/LMSCourses";
import { baseURL } from "../../../consts";

interface Props {
  course: CourseItem;
  onBack: () => void;
}

type RawAttachment = string | AttachedFile | AttachedFile[] | null;

function normalizeSingleAttachment(
  attachment: string | AttachedFile,
  index: number,
): AttachedFile {
  if (typeof attachment === "string") {
    const url = attachment.startsWith("http")
      ? attachment
      : `${baseURL}/${attachment}`;

    return {
      id: index + 1,
      name: "ملف مرفق",
      size: 0,
      type: "",
      url,
    };
  }

  const url = attachment.url
    ? attachment.url.startsWith("http")
      ? attachment.url
      : `${baseURL}/${attachment.url}`
    : "";

  return {
    id: attachment.id ?? index + 1,
    name: attachment.name || "ملف مرفق",
    size: attachment.size ?? 0,
    type: attachment.type ?? "",
    url,
  };
}

function normalizeAttachments(attachment: RawAttachment): AttachedFile[] {
  if (!attachment) return [];

  if (Array.isArray(attachment)) {
    return attachment.map((item, index) => normalizeSingleAttachment(item, index));
  }

  return [normalizeSingleAttachment(attachment, 0)];
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024)
    return (bytes / 1024).toFixed(1) + " KB";

  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function getFileIcon(type: string) {
  if (type.startsWith("image/")) return Image;

  if (type === "application/pdf") return FileText;

  return File;
}

function normalizeVideoUrl(url: string) {
  if (!url) return "";

  // google drive
  const driveMatch = url.match(/(?:drive\.google\.com\/file\/d\/|drive\.google\.com\/open\?id=)([a-zA-Z0-9_-]+)/);
  if (driveMatch) {
    const fileId = driveMatch[1];
    return `https://drive.google.com/file/d/${fileId}/preview`;
  }

  // youtube
  const youtubeMatch = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/,
  );
  if (youtubeMatch) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  }

  // vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  // direct url (http/https) or relative path
  return url.startsWith("http")
    ? url
    : `${baseURL}/${url}`;
}

function FileCard({ att }: { att: AttachedFile }) {
  const Icon = getFileIcon(att.type);

  return (
    <a
      href={att.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3 transition-all hover:border-blue-200 hover:shadow-sm"
    >
      <div className="flex-shrink-0 rounded-xl bg-primary-50 p-2.5 transition-colors group-hover:bg-primary-100">
        <Icon className="h-5 w-5 text-blue-500" />
      </div>

      <div className="min-w-0 flex-1 text-start">
        <p className="truncate text-sm font-medium text-gray-800">
          {att.name}
        </p>

        <p className="mt-0.5 text-xs text-gray-400">
          {formatFileSize(att.size)}
        </p>
      </div>

      <Download className="h-4 w-4 flex-shrink-0 text-gray-400 transition-colors group-hover:text-blue-500" />
    </a>
  );
}

export default function CourseViewer({
  course,
  onBack,
}: Props) {
  const finalVideoUrl = normalizeVideoUrl(
    course.videoUrl,
  );

  const ytThumb = course.videoUrl
    ? getYoutubeThumbnail(course.videoUrl)
    : null;

  const displayThumb = course.image
    ? `${baseURL}/${course.image}`
    : ytThumb;

  const attachmentsList = normalizeAttachments(course.attatchments);

  if (course.pdfurl) {
    attachmentsList.push({
      id: attachmentsList.length + 1,
      name: "ملف PDF",
      size: 0,
      type: "application/pdf",
      url: course.pdfurl.startsWith("http")
        ? course.pdfurl
        : `${baseURL}/${course.pdfurl}`,
    });
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Back */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm transition-all hover:border-gray-300 hover:text-gray-900"
        >
          <ArrowRight className="h-4 w-4" />

          رجوع للكورسات
        </button>

        <div className="h-4 w-px bg-gray-200" />

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-primary-50 px-2.5 py-1 text-xs font-medium text-blue-600">
            {course.subject?.name_ar || ""}
          </span>
        </div>
      </div>

      {/* Video */}
      <div className="overflow-hidden rounded-2xl bg-black shadow-lg">
        {course.videoUrl ? (
          finalVideoUrl.includes("drive.google.com") ||
          finalVideoUrl.includes("youtube.com") ||
          finalVideoUrl.includes("vimeo.com") ? (
            <div
              className="relative w-full"
              style={{ paddingBottom: "56.25%" }}
            >
              <iframe
                src={finalVideoUrl}
                title={course.title}
                className="absolute inset-0 h-full w-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
          ) : (
            <video
              controls
              className="max-h-[500px] w-full object-contain"
              poster={displayThumb || undefined}
            >
              <source src={finalVideoUrl} type="video/mp4" />
              <source src={finalVideoUrl} type="video/webm" />
              <source src={finalVideoUrl} type="video/ogg" />
              <source src={finalVideoUrl} type="video/quicktime" />

              Your browser does not support video.
            </video>
          )
        ) : displayThumb ? (
          <div className="relative">
            <img
              src={displayThumb}
              alt={course.title}
              className="max-h-[500px] w-full object-cover"
            />

            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <div className="rounded-full bg-white/10 p-5 backdrop-blur-sm">
                <BookOpen className="h-10 w-10 text-white/80" />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-64 items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
            <div className="text-center">
              <BookOpen className="mx-auto mb-3 h-14 w-14 text-gray-600" />

              <p className="text-sm text-gray-500">
                لا يوجد فيديو لهذا الكورس
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main */}
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h1 className="mb-3 text-start text-2xl font-bold text-gray-900">
              {course.title}
            </h1>

            <div className="mb-4 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-gray-400" />

                <span className="rounded-full bg-primary-50 px-2 py-0.5 text-xs font-medium text-blue-600">
                  {course.subject?.name_ar || ""}
                </span>
              </div>

              <span className="text-xs text-gray-400">
                {new Date(
                  course.createdAt,
                ).toLocaleDateString()}
              </span>
            </div>

            {course.description ? (
              <div>
                <h2 className="mb-2 text-start text-sm font-semibold text-gray-700">
                  الوصف
                </h2>

                <p className="text-start text-sm leading-relaxed text-gray-600">
                  {course.description}
                </p>
              </div>
            ) : (
              <p className="text-start text-sm text-gray-400">
                لا يوجد وصف لهذا الكورس
              </p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="mb-4 flex items-center justify-end gap-2 text-start text-sm font-semibold text-gray-700">
              <span>الملفات المرفقة</span>

              {attachmentsList.length > 0 && (
                <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-bold text-blue-600">
                  {attachmentsList.length}
                </span>
              )}
            </h2>

            {attachmentsList.length > 0 ? (
              <div className="space-y-2">
                {attachmentsList.map((att) => (
                  <FileCard
                    key={att.id}
                    att={att as AttachedFile}
                  />
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <File className="mx-auto mb-2 h-8 w-8 text-gray-300" />

                <p className="text-sm text-gray-400">
                  لا توجد ملفات مرفقة
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useFeedback } from "../hooks/useFeedback";
import { FeedBackItem } from "../../../types/feedback";
import ViewFeedbackModal from "../../../components/modals/ViewFeedbackModal";
import Pagination from "../../../components/ui/Pagination";
import { Star, Calendar, Clock, Search, MessageSquare, BookOpen } from "lucide-react";
import { useDebounce } from "../../../hooks/useDebounce";

const FeedbackPage = () => {
    const { i18n } = useTranslation();
    const language = i18n.language.split('-')[0] || 'en';
    const [page, setPage] = useState(1);
    const limit = 15;
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    useEffect(() => {
        setPage(1);
    }, [debouncedSearchTerm]);

    const { data, isLoading, isError } = useFeedback(page, limit, debouncedSearchTerm);

    const [selectedFeedback, setSelectedFeedback] = useState<FeedBackItem | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (isLoading) return (
        <div className="flex justify-center items-center p-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    );
    if (isError) return (
        <div className="text-red-500 text-center p-10 font-bold">
            {language === 'ar' ? 'حدث خطأ أثناء تحميل التقارير' : 'Error loading reports'}
        </div>
    );

    const allFeedbacks: FeedBackItem[] = data?.data?.items || [];
    const pagination = data?.data?.pagination;

    const handleCardClick = (item: FeedBackItem) => {
        setSelectedFeedback(item);
        setIsModalOpen(true);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-emerald-100 text-emerald-700';
            case 'missed': return 'bg-red-100 text-red-700';
            case 'scheduled': return 'bg-blue-100 text-blue-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusLabel = (status: string) => {
        if (language === 'ar') {
            switch (status) {
                case 'completed': return 'مكتملة';
                case 'missed': return 'فائتة';
                case 'scheduled': return 'مجدولة';
                default: return status;
            }
        }
        return status.charAt(0).toUpperCase() + status.slice(1);
    };

    // Compute average rating from reviews in a session item
    const getAvgRating = (item: FeedBackItem): number | null => {
        if (!item.reviews || item.reviews.length === 0) return null;
        const sum = item.reviews.reduce((acc, r) => acc + r.rating, 0);
        return Math.round((sum / item.reviews.length) * 10) / 10;
    };

    // Find teacher and student names from reviews
    const getTeacherName = (item: FeedBackItem): string => {
        const teacherReview = item.reviews.find(r => r.role === 'teacher');
        if (teacherReview) return teacherReview.reviewer.name;
        const studentReview = item.reviews.find(r => r.role === 'student');
        if (studentReview) return studentReview.reviewee.name;
        return language === 'ar' ? 'غير محدد' : 'Unknown';
    };

    const getStudentName = (item: FeedBackItem): string => {
        const studentReview = item.reviews.find(r => r.role === 'student');
        if (studentReview) return studentReview.reviewer.name;
        const teacherReview = item.reviews.find(r => r.role === 'teacher');
        if (teacherReview) return teacherReview.reviewee.name;
        return language === 'ar' ? 'غير محدد' : 'Unknown';
    };

    return (
        <div className="p-6 space-y-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                    {language === 'ar' ? 'التقييمات' : 'Feedback'}
                </h1>

                <div className="relative w-full md:w-96">
                    <input
                        type="text"
                        placeholder={language === 'ar' ? 'ابحث باسم المعلم أو الطالب...' : 'Search by teacher or student...'}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`w-full ${language === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary shadow-sm transition-all bg-white`}
                    />
                    <Search className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 ${language === 'ar' ? 'right-3' : 'left-3'}`} />
                </div>
            </div>

            {allFeedbacks.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100">
                    <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-lg">
                        {language === 'ar' ? 'لا توجد تقييمات مطابقة' : 'No matching feedback found'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {allFeedbacks.map((item) => {
                        const avgRating = getAvgRating(item);
                        const reviewCount = item.reviews?.length || 0;
                        const teacherName = getTeacherName(item);
                        const studentName = getStudentName(item);

                        return (
                            <div
                                key={item.schedule.id}
                                onClick={() => handleCardClick(item)}
                                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 cursor-pointer group hover:-translate-y-1"
                            >
                                {/* Title + Status */}
                                <div className="flex justify-between items-start mb-4 gap-2">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                                            <BookOpen className="w-4 h-4 text-primary" />
                                        </div>
                                        <h3 className="font-bold text-base text-gray-900 group-hover:text-primary transition-colors line-clamp-1">
                                            {item.schedule.title}
                                        </h3>
                                    </div>
                                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${getStatusColor(item.schedule.status)}`}>
                                        {getStatusLabel(item.schedule.status)}
                                    </span>
                                </div>

                                {/* Date & Time */}
                                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <span>{formatDate(item.schedule.start_time)}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-4 h-4 text-gray-400" />
                                        <span dir="ltr">{formatTime(item.schedule.start_time)}</span>
                                    </div>
                                </div>

                                {/* Teacher & Student names */}
                                <div className="space-y-1.5 mb-4 text-sm text-gray-600">
                                    <div className="flex gap-1.5">
                                        <span className="font-semibold shrink-0">
                                            {language === 'ar' ? 'المعلم:' : 'Teacher:'}
                                        </span>
                                        <span className="truncate">{teacherName}</span>
                                    </div>
                                    <div className="flex gap-1.5">
                                        <span className="font-semibold shrink-0">
                                            {language === 'ar' ? 'الطالب:' : 'Student:'}
                                        </span>
                                        <span className="truncate">{studentName}</span>
                                    </div>
                                </div>

                                {/* Rating + Reviews count */}
                                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                                    <div className="flex items-center gap-1">
                                        {avgRating !== null ? (
                                            <>
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`w-4 h-4 ${i < Math.round(avgRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`}
                                                    />
                                                ))}
                                                <span className="text-sm font-bold text-yellow-700 ms-1">{avgRating}</span>
                                            </>
                                        ) : (
                                            <span className="text-sm text-gray-400">
                                                {language === 'ar' ? 'لا يوجد تقييم' : 'No rating'}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                                        <MessageSquare className="w-3.5 h-3.5" />
                                        <span>{reviewCount} {language === 'ar' ? 'تقييم' : reviewCount === 1 ? 'review' : 'reviews'}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {pagination && pagination.totalPages >= 1 && (
                <div className="mt-8 overflow-hidden shadow-sm">
                    <Pagination
                        currentPage={pagination.page}
                        totalPages={pagination.totalPages}
                        totalItems={pagination.totalItems}
                        itemsPerPage={pagination.limit}
                        onPageChange={setPage}
                    />
                </div>
            )}

            <ViewFeedbackModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                feedback={selectedFeedback}
            />
        </div>
    );
}

export default FeedbackPage;

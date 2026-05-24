import { useLanguage } from '../../contexts/LanguageContext';
import { X, Trash2, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Level, LevelColorOption } from '../../types/lmsCourses';

interface LevelsModalProps {
    isOpen: boolean;
    onClose: () => void;
    levels: Level[];
    handleDeleteLevel: (id: number) => void;
    newLevelName: string;
    setNewLevelName: (name: string) => void;
    newLevelColor: string;
    setNewLevelColor: (color: string) => void;
    levelColorOptions: LevelColorOption[];
    handleAddLevel: () => void;
}

const LevelsModal = ({
    isOpen,
    onClose,
    levels,
    handleDeleteLevel,
    newLevelName,
    setNewLevelName,
    newLevelColor,
    setNewLevelColor,
    levelColorOptions,
    handleAddLevel,
}: LevelsModalProps) => {
    const { language } = useLanguage();
    const { t } = useTranslation();

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 !mt-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200" dir={language === 'ar' ? 'rtl' : 'ltr'}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-[var(--color-primary)] px-6 py-4 flex items-center justify-between shrink-0">
                    <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
                        <X className="w-5 h-5 text-white/80" />
                    </button>
                    <h2 className="text-xl font-bold text-white">{t('courses_manage_levels')}</h2>
                </div>

                <div className="p-6 flex flex-col gap-6">
                    {/* List of Levels */}
                    <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
                        {levels.map(l => (
                            <div key={l.id} className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 hover:bg-gray-100 transition-colors">
                                <button
                                    onClick={() => handleDeleteLevel(l.id)}
                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                    title={t('courses_delete')}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                <span className={`text-sm font-bold px-3 py-1 rounded-full shadow-sm ${l.color}`}>
                                    {l.name}
                                </span>
                            </div>
                        ))}
                        {levels.length === 0 && (
                            <p className="text-center text-sm text-gray-400 py-4 italic">{t('courses_no_levels')}</p>
                        )}
                    </div>

                    {/* Add New Level Section */}
                    <div className="border-t border-gray-100 pt-5 space-y-4">
                        <h3 className="text-sm font-bold text-gray-800">{t('courses_add_level_title')}</h3>

                        <div className="space-y-3">
                            <input
                                type="text"
                                value={newLevelName}
                                onChange={e => setNewLevelName(e.target.value)}
                                placeholder={t('courses_level_name_placeholder')}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white transition-all text-start"
                                onKeyDown={e => e.key === 'Enter' && handleAddLevel()}
                            />

                            {/* Color Selection */}
                            <div className="flex gap-2 flex-wrap justify-end">
                                {levelColorOptions.map(opt => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setNewLevelColor(opt.value)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border-2 ${newLevelColor === opt.value
                                            ? 'border-primary shadow-sm scale-105 ' + opt.value
                                            : 'border-transparent opacity-70 hover:opacity-100 ' + opt.value
                                            }`}
                                    >
                                        {t(`color_${opt.label.toLowerCase()}`)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleAddLevel}
                            disabled={!newLevelName.trim()}
                            className="w-full flex items-center justify-center gap-2 btn-primary disabled:opacity-40 text-white py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-primary/20 active:scale-[0.98]"
                        >
                            <Plus className="w-4 h-4" />
                            {t('add')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LevelsModal;

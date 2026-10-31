"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Star, MessageSquare, User, Camera, X, Image as ImageIcon, Loader2 } from "lucide-react";
import Link from "next/link";

export default function ReviewsSection({ productId }: { productId: string }) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [rating, setRating] = useState(5);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Стейты для картинок
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  useEffect(() => {
    fetch(`/api/reviews?productId=${productId}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setReviews(data);
      })
      .finally(() => setLoading(false));
  }, [productId]);

  // Обработка выбора фото
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      // Ограничим до 3-х фото, чтобы не перегружать
      const newFiles = [...selectedImages, ...filesArray].slice(0, 3);
      
      setSelectedImages(newFiles);
      
      // Создаем ссылки для превью
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setPreviewUrls(newPreviews);
    }
  };

  const removeImage = (index: number) => {
    const newFiles = [...selectedImages];
    newFiles.splice(index, 1);
    setSelectedImages(newFiles);
    
    const newPreviews = [...previewUrls];
    newPreviews.splice(index, 1);
    setPreviewUrls(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) return;
    setSubmitting(true);

    try {
      // 1. Загружаем картинки (если они есть)
      let uploadedUrls: string[] = [];
      if (selectedImages.length > 0) {
        const formData = new FormData();
        selectedImages.forEach(file => formData.append("files", file)); // Обрати внимание, в твоем API может быть "file" вместо "files"

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          // Если API возвращает массив ссылок
          uploadedUrls = Array.isArray(uploadData) ? uploadData.map((d: any) => d.url) : [uploadData.url]; 
        }
      }

      // 2. Отправляем отзыв с ссылками на фото
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rating, text, images: uploadedUrls }),
      });

      if (res.ok) {
        const newReview = await res.json();
        setReviews([newReview, ...reviews]);
        setText("");
        setRating(5);
        setSelectedImages([]);
        setPreviewUrls([]);
      } else {
        alert("Ошибка при отправке отзыва");
      }
    } catch (e) {
      console.error(e);
      alert("Ошибка сети при загрузке");
    } finally {
      setSubmitting(false);
    }
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) 
    : "0.0";

  return (
    <div className="mt-16 pt-8 border-t border-gray-200 dark:border-slate-700">
      <div className="flex items-center gap-4 mb-8">
        <h2 className="text-2xl font-bold dark:text-white">Отзывы</h2>
        <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1 rounded-lg">
          <Star size={20} className="text-yellow-500 fill-yellow-500" />
          <span className="font-bold text-lg text-gray-900 dark:text-white">{averageRating}</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">({reviews.length})</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Форма добавления отзыва */}
        <div className="lg:col-span-1">
          <div className="glass-panel p-6 rounded-2xl sticky top-24">
            <h3 className="font-bold dark:text-white mb-4">Оставить отзыв</h3>
            
            {!session ? (
              <div className="text-center py-4">
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Войдите, чтобы оставить отзыв</p>
                <Link href="/login" className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">
                  Войти
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredStar(star)}
                      onMouseLeave={() => setHoveredStar(0)}
                      className="p-1 transition-colors"
                    >
                      <Star 
                        size={24} 
                        className={`${star <= (hoveredStar || rating) ? "text-yellow-500 fill-yellow-500" : "text-gray-300 dark:text-slate-600"}`} 
                      />
                    </button>
                  ))}
                </div>
                
                <textarea
                  required
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Расскажите о своих впечатлениях..."
                  rows={4}
                  className="w-full p-3 rounded-xl border dark:border-slate-700 bg-gray-50 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />

                {/* БЛОК ЗАГРУЗКИ ФОТО */}
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    {previewUrls.map((url, i) => (
                      <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 dark:border-slate-700 group">
                        <img src={url} alt="Preview" className="w-full h-full object-cover" />
                        <button 
                          type="button" 
                          onClick={() => removeImage(i)}
                          className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={16} className="text-white" />
                        </button>
                      </div>
                    ))}
                    
                    {selectedImages.length < 3 && (
                      <label className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 dark:border-slate-600 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:text-blue-500 text-gray-400 transition-colors bg-gray-50 dark:bg-slate-800/50">
                        <Camera size={20} />
                        <span className="text-[10px] mt-1 font-medium">Фото</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          multiple 
                          className="hidden" 
                          onChange={handleImageChange} 
                        />
                      </label>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-400">Можно прикрепить до 3-х фото</p>
                </div>
                
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full py-2 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition-colors disabled:opacity-50 text-sm flex items-center justify-center gap-2"
                >
                  {submitting ? <><Loader2 size={16} className="animate-spin" /> Загрузка...</> : "Отправить отзыв"}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Список отзывов */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="text-center text-gray-500 py-8">Загрузка отзывов...</div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-slate-700">
              <MessageSquare size={32} className="mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500 dark:text-gray-400">Здесь пока нет отзывов. Будьте первым!</p>
            </div>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="glass-panel p-4 rounded-2xl">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-500 rounded-full flex items-center justify-center shrink-0">
                      <User size={16} />
                    </div>
                    <div>
                      <p className="font-bold text-sm dark:text-white">{review.user?.name || "Пользователь"}</p>
                      <div className="flex gap-0.5 mt-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} size={12} className={s <= review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300 dark:text-slate-600"} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(review.createdAt).toLocaleDateString('ru-RU')}
                  </span>
                </div>
                
                <p className="text-gray-700 dark:text-gray-300 text-sm mt-2">{review.text}</p>

                {/* ВЫВОД ФОТОГРАФИЙ ИЗ ОТЗЫВА */}
                {review.images && review.images.length > 0 && (
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {review.images.map((img: string, idx: number) => (
                      <a 
                        key={idx} 
                        href={img} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 dark:border-slate-700 hover:border-blue-500 transition-colors"
                      >
                        <img src={img} alt="Фото из отзыва" className="w-full h-full object-cover hover:scale-110 transition-transform duration-300" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
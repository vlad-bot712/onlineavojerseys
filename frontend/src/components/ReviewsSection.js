import React, { useState, useEffect } from 'react';
import { Star, Send, Image, X, ChevronDown, ChevronUp } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function ReviewsSection() {
  const [reviews, setReviews] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    text: '',
    stars: 5,
    image: null
  });

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/reviews?limit=50`);
      setReviews(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Imaginea trebuie să fie sub 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Te rog introdu numele');
      return;
    }
    if (!formData.text.trim()) {
      toast.error('Te rog scrie o recenzie');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/reviews`, formData);
      toast.success('Recenzie trimisă! Mulțumim!');
      setFormData({ name: '', text: '', stars: 5, image: null });
      setShowForm(false);
      loadReviews();
    } catch (err) {
      toast.error('Eroare la trimitere');
    } finally {
      setLoading(false);
    }
  };

  const displayedReviews = showAll ? reviews : reviews.slice(0, 3);
  const averageStars = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.stars, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <section className="py-16 bg-neutral-100">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">RECENZII CLIENȚI</h2>
          {reviews.length > 0 && (
            <div className="flex items-center justify-center space-x-2">
              <div className="flex">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className={`w-6 h-6 ${i <= Math.round(averageStars) ? 'fill-yellow-400 text-yellow-400' : 'text-neutral-300'}`} />
                ))}
              </div>
              <span className="text-xl font-bold">{averageStars}</span>
              <span className="text-neutral-500">({reviews.length} recenzii)</span>
            </div>
          )}
        </div>

        {/* Add Review Button */}
        {!showForm && (
          <div className="text-center mb-8">
            <button
              onClick={() => setShowForm(true)}
              className="bg-[#CCFF00] text-black px-8 py-3 font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              ✍️ SCRIE O RECENZIE
            </button>
          </div>
        )}

        {/* Review Form */}
        {showForm && (
          <div className="max-w-xl mx-auto mb-12 bg-white border-2 border-black p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Scrie o recenzie</h3>
              <button onClick={() => setShowForm(false)} className="text-neutral-500 hover:text-black">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <input
                type="text"
                placeholder="Numele tău *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border-2 border-neutral-200 px-4 py-3 focus:outline-none focus:border-black"
              />

              {/* Stars */}
              <div>
                <label className="block text-sm font-bold mb-2">Rating</label>
                <div className="flex space-x-1">
                  {[1,2,3,4,5].map(i => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setFormData({ ...formData, stars: i })}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star className={`w-8 h-8 ${i <= formData.stars ? 'fill-yellow-400 text-yellow-400' : 'text-neutral-300'}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Text */}
              <textarea
                placeholder="Scrie recenzia ta... *"
                value={formData.text}
                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                rows={4}
                className="w-full border-2 border-neutral-200 px-4 py-3 focus:outline-none focus:border-black resize-none"
              />

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-bold mb-2">Adaugă o poză (opțional)</label>
                {formData.image ? (
                  <div className="relative inline-block">
                    <img src={formData.image} alt="Preview" className="w-32 h-32 object-cover border-2 border-neutral-200" />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image: null })}
                      className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center space-x-2 cursor-pointer bg-neutral-100 border-2 border-dashed border-neutral-300 px-4 py-3 hover:border-black transition-colors">
                    <Image className="w-5 h-5" />
                    <span>Încarcă imagine</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-3 font-bold flex items-center justify-center space-x-2 hover:bg-neutral-800 disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
                <span>{loading ? 'Se trimite...' : 'TRIMITE RECENZIA'}</span>
              </button>
            </form>
          </div>
        )}

        {/* Reviews Grid */}
        {reviews.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedReviews.map((review, idx) => (
                <div key={review.id || idx} className="bg-white border-2 border-neutral-200 p-6 hover:border-black transition-colors">
                  {/* Stars */}
                  <div className="flex mb-3">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className={`w-5 h-5 ${i <= review.stars ? 'fill-yellow-400 text-yellow-400' : 'text-neutral-200'}`} />
                    ))}
                  </div>
                  
                  {/* Text */}
                  <p className="text-neutral-700 mb-4 whitespace-pre-wrap">{review.text}</p>
                  
                  {/* Image */}
                  {review.image && (
                    <img 
                      src={review.image} 
                      alt="Review" 
                      className="w-full h-48 object-cover mb-4 border border-neutral-200 cursor-pointer hover:opacity-90"
                      onClick={() => window.open(review.image, '_blank')}
                    />
                  )}
                  
                  {/* Author & Date */}
                  <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                    <span className="font-bold">{review.name}</span>
                    <span className="text-sm text-neutral-400">
                      {new Date(review.created_at).toLocaleDateString('ro-RO')}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Show All Button */}
            {reviews.length > 3 && (
              <div className="text-center mt-8">
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="bg-white border-2 border-black px-8 py-3 font-bold flex items-center space-x-2 mx-auto hover:bg-neutral-50 transition-colors"
                >
                  {showAll ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  <span>{showAll ? 'ARATĂ MAI PUȚINE' : `VEZI TOATE RECENZIILE (${reviews.length})`}</span>
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 bg-white border-2 border-dashed border-neutral-300">
            <p className="text-neutral-500 text-lg">Nu sunt recenzii încă. Fii primul care lasă o recenzie!</p>
          </div>
        )}
      </div>
    </section>
  );
}

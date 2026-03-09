import React, { useState } from 'react';
import { X, Ruler } from 'lucide-react';

export default function SizeChartModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('fan'); // 'fan' or 'player'

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        {/* Header */}
        <div className="sticky top-0 bg-black text-white p-4 flex items-center justify-between z-10">
          <div className="flex items-center space-x-2">
            <Ruler className="w-6 h-6" />
            <h2 className="text-xl font-bold">TABEL DE MĂRIMI</h2>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b-2 border-black">
          <button
            onClick={() => setActiveTab('fan')}
            className={`flex-1 py-4 font-bold text-lg transition-all ${
              activeTab === 'fan' 
                ? 'bg-[#CCFF00] text-black' 
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            FAN VERSION
          </button>
          <button
            onClick={() => setActiveTab('player')}
            className={`flex-1 py-4 font-bold text-lg transition-all ${
              activeTab === 'player' 
                ? 'bg-[#CCFF00] text-black' 
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            PLAYER VERSION
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'fan' ? (
            <div className="space-y-6">
              {/* Fan Version Image */}
              <div className="border-2 border-neutral-200 p-4 bg-neutral-50">
                <img 
                  src="/images/size-chart-fan.jpg" 
                  alt="Tabel mărimi Fan Version"
                  className="w-full h-auto"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                <div className="hidden text-center py-8 text-neutral-500">
                  <Ruler className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>Imaginea tabelului de mărimi va fi adăugată aici</p>
                  <p className="text-sm mt-2">Salvează imaginea ca: <code className="bg-neutral-200 px-2 py-1">/images/size-chart-fan.jpg</code></p>
                </div>
              </div>

              {/* Fan Version Text */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold border-b-2 border-[#CCFF00] pb-2">FAN VERSION - Informații</h3>
                
                <div className="bg-blue-50 border-2 border-blue-200 p-4">
                  <h4 className="font-bold text-blue-800 mb-2">📏 Cum să te măsori corect:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• <strong>Piept:</strong> Măsoară circumferința pieptului la cel mai lat punct</li>
                    <li>• <strong>Lungime:</strong> De la umăr până la tiv</li>
                    <li>• <strong>Umeri:</strong> De la un umăr la celălalt</li>
                  </ul>
                </div>

                <div className="bg-neutral-100 border-2 border-neutral-300 p-4">
                  <h4 className="font-bold mb-2">Caracteristici Fan Version:</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Material confortabil pentru purtare zilnică</li>
                    <li>• Croială regular fit (nu aderă la corp)</li>
                    <li>• Ideal pentru fani și colecționari</li>
                    <li>• Recomandat pentru activități casual</li>
                  </ul>
                </div>

                <table className="w-full border-2 border-black text-sm">
                  <thead className="bg-black text-white">
                    <tr>
                      <th className="p-3 text-left">Mărime</th>
                      <th className="p-3 text-center">Piept (cm)</th>
                      <th className="p-3 text-center">Lungime (cm)</th>
                      <th className="p-3 text-center">Umeri (cm)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-neutral-200">
                      <td className="p-3 font-bold">S</td>
                      <td className="p-3 text-center">96-100</td>
                      <td className="p-3 text-center">70</td>
                      <td className="p-3 text-center">44</td>
                    </tr>
                    <tr className="border-b border-neutral-200 bg-neutral-50">
                      <td className="p-3 font-bold">M</td>
                      <td className="p-3 text-center">100-104</td>
                      <td className="p-3 text-center">72</td>
                      <td className="p-3 text-center">46</td>
                    </tr>
                    <tr className="border-b border-neutral-200">
                      <td className="p-3 font-bold">L</td>
                      <td className="p-3 text-center">104-108</td>
                      <td className="p-3 text-center">74</td>
                      <td className="p-3 text-center">48</td>
                    </tr>
                    <tr className="border-b border-neutral-200 bg-neutral-50">
                      <td className="p-3 font-bold">XL</td>
                      <td className="p-3 text-center">108-112</td>
                      <td className="p-3 text-center">76</td>
                      <td className="p-3 text-center">50</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold">XXL</td>
                      <td className="p-3 text-center">112-116</td>
                      <td className="p-3 text-center">78</td>
                      <td className="p-3 text-center">52</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Player Version Image */}
              <div className="border-2 border-neutral-200 p-4 bg-neutral-50">
                <img 
                  src="/images/size-chart-player.jpg" 
                  alt="Tabel mărimi Player Version"
                  className="w-full h-auto"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                <div className="hidden text-center py-8 text-neutral-500">
                  <Ruler className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>Imaginea tabelului de mărimi va fi adăugată aici</p>
                  <p className="text-sm mt-2">Salvează imaginea ca: <code className="bg-neutral-200 px-2 py-1">/images/size-chart-player.jpg</code></p>
                </div>
              </div>

              {/* Player Version Text */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold border-b-2 border-[#CCFF00] pb-2">PLAYER VERSION - Informații</h3>
                
                <div className="bg-purple-50 border-2 border-purple-200 p-4">
                  <h4 className="font-bold text-purple-800 mb-2">ATENȚIE — Fit diferit!</h4>
                  <p className="text-sm text-purple-700">
                    Player Version are o croială <strong>mai strâmtă</strong> decât Fan Version. 
                    Dacă preferi un fit mai lejer, alege cu <strong>o mărime mai mare</strong>.
                  </p>
                </div>

                <div className="bg-neutral-100 border-2 border-neutral-300 p-4">
                  <h4 className="font-bold mb-2">Caracteristici Player Version:</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Material tehnic cu tehnologie Dri-FIT/ClimaCool</li>
                    <li>• Croială slim fit (aderă la corp)</li>
                    <li>• Identic cu tricourile purtate de jucători</li>
                    <li>• Ideal pentru sport și activități fizice</li>
                    <li>• Ventilație superioară</li>
                  </ul>
                </div>

                <table className="w-full border-2 border-black text-sm">
                  <thead className="bg-black text-white">
                    <tr>
                      <th className="p-3 text-left">Mărime</th>
                      <th className="p-3 text-center">Piept (cm)</th>
                      <th className="p-3 text-center">Lungime (cm)</th>
                      <th className="p-3 text-center">Umeri (cm)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-neutral-200">
                      <td className="p-3 font-bold">S</td>
                      <td className="p-3 text-center">92-96</td>
                      <td className="p-3 text-center">69</td>
                      <td className="p-3 text-center">43</td>
                    </tr>
                    <tr className="border-b border-neutral-200 bg-neutral-50">
                      <td className="p-3 font-bold">M</td>
                      <td className="p-3 text-center">96-100</td>
                      <td className="p-3 text-center">71</td>
                      <td className="p-3 text-center">45</td>
                    </tr>
                    <tr className="border-b border-neutral-200">
                      <td className="p-3 font-bold">L</td>
                      <td className="p-3 text-center">100-104</td>
                      <td className="p-3 text-center">73</td>
                      <td className="p-3 text-center">47</td>
                    </tr>
                    <tr className="border-b border-neutral-200 bg-neutral-50">
                      <td className="p-3 font-bold">XL</td>
                      <td className="p-3 text-center">104-108</td>
                      <td className="p-3 text-center">75</td>
                      <td className="p-3 text-center">49</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold">XXL</td>
                      <td className="p-3 text-center">108-112</td>
                      <td className="p-3 text-center">77</td>
                      <td className="p-3 text-center">51</td>
                    </tr>
                  </tbody>
                </table>

                <div className="bg-yellow-50 border-2 border-yellow-300 p-4">
                  <h4 className="font-bold text-yellow-800 mb-2">💡 Sfat:</h4>
                  <p className="text-sm text-yellow-700">
                    Dacă ești între două mărimi sau preferi un fit mai relaxat, 
                    recomandăm să alegi mărimea mai mare.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-neutral-100 border-t-2 border-black p-4">
          <button
            onClick={onClose}
            className="w-full bg-black text-white py-3 font-bold uppercase hover:bg-neutral-800 transition-colors"
          >
            ÎNCHIDE
          </button>
        </div>
      </div>
    </div>
  );
}

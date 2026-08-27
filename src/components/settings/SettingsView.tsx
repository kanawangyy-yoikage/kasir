import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Settings, Save, Download, Upload, RotateCcw, Volume2, Store, QrCode, Trash2, Loader2 } from 'lucide-react';
import { decodeQRFromFile, fileToCompressedDataUrl } from '@/utils/image';
import { validateQRIS, parseQRIS } from '@/lib/qris';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    soundEnabled,
    toggleSound,
    backupDatabaseJSON,
    restoreDatabaseJSON,
    resetToInitialData,
    showToast,
  } = useApp();

  const [name, setName] = useState(settings.name);
  const [tagline, setTagline] = useState(settings.tagline);
  const [phone, setPhone] = useState(settings.phone);
  const [email, setEmail] = useState(settings.email);
  const [receiptFooter, setReceiptFooter] = useState(settings.receiptFooter);
  const [qrisStatic, setQrisStatic] = useState(settings.qrisStatic || '');
  const [qrisPreview, setQrisPreview] = useState<string>('');
  const [qrisBusy, setQrisBusy] = useState(false);

  const handleSaveSettings = () => {
    updateSettings({
      name,
      tagline,
      phone,
      email,
      receiptFooter,
      qrisStatic: qrisStatic || undefined,
    });
    showToast('success', 'Pengaturan toko berhasil diperbarui!');
  };

  const handleQrisImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    setQrisBusy(true);
    try {
      // Compress + preview (used as the stored image for rendering later too)
      const dataUrl = await fileToCompressedDataUrl(file, {
        maxDimension: 1024,
        quality: 0.9,
        type: 'image/png',
      });
      setQrisPreview(dataUrl);

      // Decode the QR payload
      const qrisString = await decodeQRFromFile(file);
      if (!qrisString) {
        showToast('error', 'Tidak dapat membaca kode QR dari gambar. Gunakan gambar QRIS yang jelas.');
        setQrisPreview('');
        return;
      }

      // Validate it looks like a QRIS payload
      const parsed = parseQRIS(qrisString);
      const validation = validateQRIS(parsed);
      if (!validation.valid) {
        showToast('error', 'Gambar bukan QRIS yang valid: ' + validation.errors.join(', '));
        setQrisPreview('');
        return;
      }

      setQrisStatic(qrisString);
      showToast('success', 'QRIS statis berhasil dibaca dari gambar.');
    } catch (err) {
      console.error(err);
      showToast('error', err instanceof Error ? err.message : 'Gagal mengunggah gambar QRIS.');
      setQrisPreview('');
    } finally {
      setQrisBusy(false);
    }
  };

  const handleClearQris = () => {
    setQrisStatic('');
    setQrisPreview('');
  };

  const handleDownloadBackup = () => {
    const jsonStr = backupDatabaseJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_my_kasir_gweh_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('success', 'File cadangan JSON database berhasil diunduh.');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (content) {
        restoreDatabaseJSON(content);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
          Pengaturan Toko & Konfigurasi Sistem
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Identitas bisnis, footer struk thermal, QRIS statis, dan cadangan data
        </p>
      </div>

      {/* Store Identity Card */}
      <Card className="p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Store className="h-4 w-4 text-blue-600" />
          <span>Profil & Identitas Bisnis</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Nama Usaha / Toko *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Slogan / Tagline
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Nomor Telepon / CS
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Email Resmi
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
            />
          </div>
        </div>

        {/* Receipt Footer */}
        <div className="pt-2">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Pesan Penutup Struk Thermal (Receipt Footer)
          </label>
          <textarea
            rows={3}
            value={receiptFooter}
            onChange={(e) => setReceiptFooter(e.target.value)}
            className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
          />
        </div>

        <Button
          variant="primary"
          onClick={handleSaveSettings}
          leftIcon={<Save className="h-4 w-4" />}
          className="font-bold bg-blue-600"
        >
          Simpan Konfigurasi
        </Button>
      </Card>

      {/* QRIS Configuration */}
      <Card className="p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <QrCode className="h-4 w-4 text-blue-600" />
          <span>QRIS Statis (untuk QRIS Dinamis saat pembayaran)</span>
        </h3>
        <p className="text-xs text-slate-500">
          Unggah gambar QRIS statis milik toko Anda. Sistem akan membaca kode nya lalu mengubahnya
          menjadi QRIS Dinamis (dengan nominal sesuai transaksi) setiap kali pembayaran QRIS di kasir.
        </p>

        <div className="flex flex-col sm:flex-row items-start gap-4">
          {/* Preview */}
          <div className="shrink-0 w-40 h-40 rounded-2xl border border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
            {qrisPreview ? (
              <img
                src={qrisPreview}
                alt="Pratinjau QRIS"
                className="w-full h-full object-contain"
              />
            ) : qrisStatic ? (
              <QrCode className="h-10 w-10 text-emerald-600" />
            ) : (
              <span className="text-[10px] text-slate-400 text-center px-2">
                Belum ada QRIS
              </span>
            )}
          </div>

          <div className="space-y-3 flex-1">
            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 cursor-pointer">
              {qrisBusy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              <span>{qrisBusy ? 'Membaca QRIS...' : 'Unggah Gambar QRIS'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleQrisImageUpload}
                className="hidden"
                disabled={qrisBusy}
              />
            </label>

            {qrisStatic && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded-lg">
                  QRIS statis tersimpan ✓
                </span>
                <button
                  onClick={handleClearQris}
                  className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-600 hover:underline"
                >
                  <Trash2 className="h-3 w-3" />
                  Hapus
                </button>
              </div>
            )}

            {qrisStatic && (
              <p className="text-[10px] text-slate-400 break-all bg-slate-50 dark:bg-slate-800 p-2 rounded-lg font-mono">
                {qrisStatic}
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Database Backup & Restore */}
      <Card className="p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
          Cadangan & Pemulihan Data (Database Backup & Restore)
        </h3>
        <p className="text-xs text-slate-500">
          Unduh seluruh data produk, transaksi, riwayat shift, dan pelanggan dalam format JSON atau pulihkan data dari file sebelumnya.
        </p>

        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={handleDownloadBackup}
            leftIcon={<Download className="h-4 w-4" />}
          >
            Unduh Cadangan JSON
          </Button>

          <label className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 cursor-pointer">
            <Upload className="h-4 w-4" />
            <span>Pulihkan Dari File JSON</span>
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>

          <Button
            variant="danger"
            onClick={() => {
              if (confirm('Apakah Anda yakin ingin mereset seluruh database ke data demo awal?')) {
                resetToInitialData();
              }
            }}
            leftIcon={<RotateCcw className="h-4 w-4" />}
            className="bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 border-none font-bold"
          >
            Reset Database Demo
          </Button>
        </div>
      </Card>
    </div>
  );
};

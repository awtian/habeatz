import { useRef, useState } from 'react';
import { Download, Upload, Trash2, AlertTriangle, Coffee } from 'lucide-react';
import { useStore } from '@/lib/state';

export function SettingsPage() {
  const settings = useStore((s) => s.settings);
  const updateSettings = useStore((s) => s.updateSettings);
  const exportState = useStore((s) => s.exportState);
  const importState = useStore((s) => s.importState);
  const resetState = useStore((s) => s.resetState);

  const fileRef = useRef<HTMLInputElement>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);

  const handleExport = () => {
    const json = exportState();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `habeatz-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const json = ev.target?.result as string;
        JSON.parse(json); // validate it's valid JSON
        importState(json);
        setImportSuccess(true);
        setImportError(null);
        setTimeout(() => setImportSuccess(false), 3000);
      } catch {
        setImportError('Invalid JSON file. Please check the file and try again.');
      }
    };
    reader.readAsText(file);
    // Reset input
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleReset = () => {
    if (confirmReset) {
      resetState();
      setConfirmReset(false);
    } else {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 5000);
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 pb-6">
      <div className="mb-4 mt-4">
        <h1 className="text-2xl font-extrabold tracking-tight">Settings</h1>
      </div>

      <div className="space-y-4">
        {/* Data Management */}
        <section className="rounded-3xl border border-border bg-card p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Data
          </h2>
          <div className="space-y-3">
            <button
              onClick={handleExport}
              className="flex w-full items-center gap-3 rounded-2xl bg-muted px-4 py-3 text-sm font-semibold transition-colors hover:bg-muted/80"
            >
              <Download size={18} className="text-primary" />
              Export JSON
            </button>

            <button
              onClick={() => fileRef.current?.click()}
              className="flex w-full items-center gap-3 rounded-2xl bg-muted px-4 py-3 text-sm font-semibold transition-colors hover:bg-muted/80"
            >
              <Upload size={18} className="text-secondary" />
              Import JSON
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />

            {importError && (
              <p className="text-sm text-danger">{importError}</p>
            )}
            {importSuccess && (
              <p className="text-sm text-success">Data imported successfully!</p>
            )}

            <button
              onClick={handleReset}
              className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors ${
                confirmReset
                  ? 'bg-danger text-danger-foreground'
                  : 'bg-muted text-danger hover:bg-danger/10'
              }`}
            >
              {confirmReset ? (
                <>
                  <AlertTriangle size={18} />
                  Tap again to confirm reset
                </>
              ) : (
                <>
                  <Trash2 size={18} />
                  Reset all data
                </>
              )}
            </button>
          </div>
        </section>

        {/* Preferences */}
        <section className="rounded-3xl border border-border bg-card p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Preferences
          </h2>
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span className="text-sm font-medium">Theme</span>
              <select
                value={settings.theme}
                onChange={(e) =>
                  updateSettings({ theme: e.target.value as 'dark' | 'light' })
                }
                className="rounded-xl border border-border bg-input-bg px-3 py-1.5 text-sm outline-none focus:border-primary"
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
              </select>
            </label>

            <label className="flex items-center justify-between">
              <span className="text-sm font-medium">Animations</span>
              <input
                type="checkbox"
                checked={settings.animationsEnabled}
                onChange={(e) =>
                  updateSettings({ animationsEnabled: e.target.checked })
                }
                className="h-5 w-5 rounded accent-primary"
              />
            </label>

            <label className="flex items-center justify-between">
              <span className="text-sm font-medium">Sound</span>
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(e) =>
                  updateSettings({ soundEnabled: e.target.checked })
                }
                className="h-5 w-5 rounded accent-primary"
              />
            </label>

            <label className="flex items-center justify-between">
              <span className="text-sm font-medium">Show odds</span>
              <input
                type="checkbox"
                checked={settings.showOdds}
                onChange={(e) =>
                  updateSettings({ showOdds: e.target.checked })
                }
                className="h-5 w-5 rounded accent-primary"
              />
            </label>

          </div>
        </section>

        {/* About */}
        <section className="rounded-3xl border border-border bg-card p-5 shadow-sm">
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
            About
          </h2>
          <p className="text-sm text-muted-foreground">
            Habeatz v1.0.0 — A playful habit rewards app.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            No real money. No backend. Just habits, tokens, and guilt-free rewards.
          </p>

          <a
            href="https://ko-fi.com/wizawt"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-[#FF5E5B] px-4 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Coffee size={18} />
            Buy me a coffee
          </a>
        </section>
      </div>
    </div>
  );
}

// Tweaks app for index.html — renders the panel and applies tweaks to the static page.
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accentVoice": "sage",
  "energy": "lively",
  "heroBackdrop": "both"
}/*EDITMODE-END*/;

const RAMP_KEYS = ["", "-100", "-200", "-300", "-400", "-500", "-600", "-700", "-800", "-900"];
let savedRamps = null;
function snapshotRamps() {
  if (savedRamps) return savedRamps;
  const cs = getComputedStyle(document.documentElement);
  savedRamps = {};
  for (const k of RAMP_KEYS) {
    savedRamps["--color-accent" + k] = cs.getPropertyValue("--color-accent" + k).trim();
    savedRamps["--color-accent-2" + k] = cs.getPropertyValue("--color-accent-2" + k).trim();
  }
  return savedRamps;
}
function applyAccentVoice(voice) {
  const root = document.documentElement;
  if (voice === "sage") {
    const snap = snapshotRamps();
    for (const k of RAMP_KEYS) {
      root.style.setProperty("--color-accent" + k, snap["--color-accent-2" + k]);
      root.style.setProperty("--color-accent-2" + k, snap["--color-accent" + k]);
    }
  } else {
    for (const k of RAMP_KEYS) {
      root.style.removeProperty("--color-accent" + k);
      root.style.removeProperty("--color-accent-2" + k);
    }
  }
}

function applyAll(t) {
  applyAccentVoice(t.accentVoice);
  document.body.setAttribute("data-energy", t.energy);
  document.body.setAttribute("data-backdrop", t.heroBackdrop);
}

function TweaksApp() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  React.useEffect(() => { applyAll(t); }, [t.accentVoice, t.energy, t.heroBackdrop]);
  return (
    <TweaksPanel>
      <TweakSection label="Feel" />
      <TweakRadio label="Accent voice" value={t.accentVoice}
                  options={["terracotta", "sage"]}
                  onChange={(v) => setTweak("accentVoice", v)} />
      <TweakRadio label="Energy" value={t.energy}
                  options={["calm", "breezy", "lively"]}
                  onChange={(v) => setTweak("energy", v)} />
      <TweakSection label="Hero" />
      <TweakRadio label="Backdrop" value={t.heroBackdrop}
                  options={["photo", "shapes", "both"]}
                  onChange={(v) => setTweak("heroBackdrop", v)} />
    </TweaksPanel>
  );
}

const mount = document.createElement("div");
document.body.appendChild(mount);
ReactDOM.createRoot(mount).render(<TweaksApp />);

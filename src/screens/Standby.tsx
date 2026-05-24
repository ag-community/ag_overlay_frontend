import { motion } from "framer-motion";
import { getAnimations, sectionVariants, type AnimTypes } from "~/animations";
import { useSettings } from "~/state/dashboard";
import { Background } from "~/components/Background";

interface StandbyScreenProps {
  from?: string;
  to: string;
}

export function StandbyScreen({ from, to }: StandbyScreenProps) {
  const [settings] = useSettings();

  const anims: AnimTypes = getAnimations(to, from ?? "");
  const slideDirection: 1 | -1 = 1;

  return (
    <motion.div
      key={`main-${to}`}
      {...(anims.main === "slide"
        ? sectionVariants.main.slide(slideDirection)
        : anims.main === "fade"
          ? sectionVariants.main.fade
          : sectionVariants.main.none)}
    >
      <div className="standby-root">
        <Background
          url={settings.backgroundUrl}
          color={settings.backgroundColor}
          opacity={settings.backgroundOpacity}
          blur={settings.backgroundBlur}
        />
        <div className="standby-content">
          <div className="standby-title">{settings.tournamentName}</div>
          <div className="standby-round">{settings.round}</div>
        </div>
      </div>
    </motion.div>
  );
}

import { Overview } from "~/components/Overview";
import { Scoreboard } from "~/components/Scoreboard";
import { TeamCard } from "~/components/TeamCard";
import { useAGOverlay } from "~/state/ag_overlay";
import { useSettings } from "~/state/dashboard";
import { motion } from "framer-motion";
import { getAnimations, sectionVariants, type AnimTypes } from "~/animations";

interface VersusScreenProps {
  from?: string;
  to: string;
}

export function VersusScreen({ from, to }: VersusScreenProps) {
  const anims: AnimTypes = getAnimations(to, from ?? "");

  const slideDirection: 1 | -1 = 1;

  const AGOverlayData = useAGOverlay();
  const [settings] = useSettings();

  const selectedServerData = AGOverlayData.find(
    (server) => server.server_ip === settings.selectedServer,
  );

  return (
    <div>
      <div className="overlay-container">
        {selectedServerData && (
          <>
            <motion.div
              {...(anims.header === "slide"
                ? sectionVariants.header.slide(slideDirection)
                : anims.header === "fade"
                  ? sectionVariants.header.fade
                  : sectionVariants.header.none)}
            >
              <Overview server={selectedServerData.data} />
            </motion.div>

            <motion.div
              {...(anims.header === "slide"
                ? sectionVariants.header.slide(slideDirection)
                : anims.header === "fade"
                  ? sectionVariants.header.fade
                  : sectionVariants.header.none)}
            >
              <Scoreboard server={selectedServerData.data} />
            </motion.div>

            <motion.div
              {...(anims.footer === "slide"
                ? sectionVariants.footer.slide(slideDirection)
                : anims.footer === "fade"
                  ? sectionVariants.footer.fade
                  : sectionVariants.footer.none)}
            >
              <TeamCard server={selectedServerData.data} side="left" />
            </motion.div>

            <motion.div
              {...(anims.footer === "slide"
                ? sectionVariants.footer.slide(slideDirection)
                : anims.footer === "fade"
                  ? sectionVariants.footer.fade
                  : sectionVariants.footer.none)}
            >
              <TeamCard server={selectedServerData.data} side="right" />
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}

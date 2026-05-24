import clsx from "clsx";
import type { AgOverlayPlayer } from "~/schemas/ag_overlay";
import weapon_9mmAR from "~/static/images/weapons/weapon_9mmAR.png";
import weapon_9mmhandgun from "~/static/images/weapons/weapon_9mmhandgun.png";
import weapon_357 from "~/static/images/weapons/weapon_357.png";
import weapon_crossbow from "~/static/images/weapons/weapon_crossbow.png";
import weapon_crowbar from "~/static/images/weapons/weapon_crowbar.png";
import weapon_egon from "~/static/images/weapons/weapon_egon.png";
import weapon_gauss from "~/static/images/weapons/weapon_gauss.png";
import weapon_handgrenade from "~/static/images/weapons/weapon_handgrenade.png";
import weapon_hornetgun from "~/static/images/weapons/weapon_hornetgun.png";
import weapon_hone from "~/static/images/weapons/weapon_none.png";
import weapon_rpg from "~/static/images/weapons/weapon_rpg.png";
import weapon_satchel from "~/static/images/weapons/weapon_satchel.png";
import weapon_shotgun from "~/static/images/weapons/weapon_shotgun.png";
import weapon_snark from "~/static/images/weapons/weapon_snark.png";
import weapon_tripmine from "~/static/images/weapons/weapon_tripmine.png";

const weaponImages: Record<string, string> = {
  weapon_9mmAR,
  weapon_9mmhandgun,
  weapon_357,
  weapon_crossbow,
  weapon_crowbar,
  weapon_egon,
  weapon_gauss,
  weapon_handgrenade,
  weapon_hornetgun,
  weapon_hone,
  weapon_rpg,
  weapon_satchel,
  weapon_shotgun,
  weapon_snark,
  weapon_tripmine,
};

type Props = {
  player: AgOverlayPlayer;
  side: "left" | "right";
};

export function WeaponCard({ player, side }: Props) {
  const weaponImg = weaponImages[player.weapon];
  return (
    <div className={clsx("weapon-card", `weapon-card-${side}`)}>
      {weaponImg ? <img src={weaponImg} /> : null}
    </div>
  );
}

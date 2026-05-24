export type AnimType = "fade" | "slide" | "none";

export interface AnimTypes {
  header: AnimType;
  main: AnimType;
  footer: AnimType;
}

const SLIDE_DISTANCE = 1920;

export const sectionVariants = {
  header: {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.2 },
    },
    slide: (direction: 1 | -1) => ({
      initial: { x: SLIDE_DISTANCE * direction, opacity: 1 },
      animate: { x: 0, opacity: 1 },
      exit: { x: -SLIDE_DISTANCE * direction, opacity: 1 },
      transition: { duration: 0.2 },
    }),
    none: {
      initial: { opacity: 1 },
      animate: { opacity: 1 },
      exit: { opacity: 1 },
      transition: { duration: 0 },
    },
  },
  main: {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.2 },
    },
    slide: (direction: 1 | -1) => ({
      initial: { x: SLIDE_DISTANCE * direction, opacity: 1 },
      animate: { x: 0, opacity: 1 },
      exit: { x: -SLIDE_DISTANCE * direction, opacity: 1 },
      transition: { duration: 0.2 },
    }),
    none: {
      initial: { opacity: 1 },
      animate: { opacity: 1 },
      exit: { opacity: 1 },
      transition: { duration: 0 },
    },
  },
  footer: {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.2 },
    },
    slide: (direction: 1 | -1) => ({
      initial: { x: SLIDE_DISTANCE * direction, opacity: 1 },
      animate: { x: 0, opacity: 1 },
      exit: { x: -SLIDE_DISTANCE * direction, opacity: 1 },
      transition: { duration: 0.2 },
    }),
    none: {
      initial: { opacity: 1 },
      animate: { opacity: 1 },
      exit: { opacity: 1 },
      transition: { duration: 0 },
    },
  },
} as const;

export function getAnimations(from: string, to: string): AnimTypes {
  const anim: AnimTypes = { header: "fade", main: "fade", footer: "fade" };

  const a = (from || "").toLowerCase();
  const b = (to || "").toLowerCase();
  const key = `${a}->${b}`;
  const rev = `${b}->${a}`;

  const either = (...pairs: string[]) =>
    pairs.some((p) => p === key || p === rev);

  if (either("start->standby", "start->mappool", "start->winner")) {
    return { header: "slide", main: "slide", footer: "none" };
  }

  if (either("start->versus")) {
    return { header: "slide", main: "slide", footer: "fade" };
  }

  if (either("standby->mappool")) {
    return { header: "fade", main: "slide", footer: "none" };
  }

  if (either("standby->versus")) {
    return { header: "fade", main: "none", footer: "fade" };
  }

  if (either("standby->winner")) {
    return { header: "slide", main: "slide", footer: "none" };
  }

  if (either("versus->mappool")) {
    return { header: "none", main: "slide", footer: "fade" };
  }

  if (either("versus->winner")) {
    return { header: "slide", main: "slide", footer: "fade" };
  }

  if (either("mappool->winner")) {
    return { header: "slide", main: "slide", footer: "none" };
  }

  // default
  // eslint-disable-next-line no-console
  // console.debug("getAnimations(default)", { from: a, to: b, key, rev });
  return anim;
}

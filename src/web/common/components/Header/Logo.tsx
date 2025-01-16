import { Link as MuiLink } from "@mui/material";
import Image from "next/image";

import { Link } from "@/web/common/components/Link";
import favicon from "~/public/favicon.png";

interface Props {
  className?: string;
  titleClassName?: string;
}

export const Logo = ({ className, titleClassName }: Props) => {
  return (
    <div className={"relative flex" + (className ? ` ${className}` : "")}>
      <Link href="/" className="flex items-center gap-2" underline="none">
        {/* use styling to set width and height instead of Image props because otherwise this throws a warning about only having height or width set */}
        {/* no idea why specifically this favicon throws this warning, and other Image-links in Header don't. */}
        <Image src={favicon} alt="home" className="size-8" />
        <span
          className={
            "text-xl font-medium text-black" + (titleClassName ? ` ${titleClassName}` : "")
          }
        >
          Ameliorate
        </span>
      </Link>
      <MuiLink
        href="https://ameliorate.app/docs/release-status"
        variant="caption"
        underline="hover"
        className="absolute -top-0.5 left-0.5 rotate-12 text-text-primary"
      >
        Alpha
      </MuiLink>
    </div>
  );
};

import MuiLink, { LinkProps as MuiLinkProps } from "@mui/material/Link";
import { styled } from "@mui/material/styles";
import clsx from "clsx";
import NextLink from "next/link";
import { useRouter } from "next/router";
import * as React from "react";

// Add support for the sx prop for consistency with the other branches.
const Anchor: any = styled("a")({});

export interface NextLinkComposedProps {
  to: string | { pathname: string };
  linkAs?: string | object;
  href?: any;
  replace?: boolean;
  scroll?: boolean;
  shallow?: boolean;
  prefetch?: boolean;
  locale?: string;
  passHref?: boolean;
  className?: string;
}

export const NextLinkComposed = React.forwardRef<
  HTMLAnchorElement,
  NextLinkComposedProps
>(function NextLinkComposed(props, ref) {
  const {
    to,
    linkAs,
    href,
    replace,
    scroll,
    shallow,
    prefetch,
    locale,
    ...other
  } = props;

  return (
    <NextLink
      href={to}
      prefetch={prefetch}
      as={linkAs}
      replace={replace}
      scroll={scroll}
      shallow={shallow}
      passHref
      locale={locale}
    >
      <Anchor
        ref={ref as React.MutableRefObject<HTMLAnchorElement>}
        {...other}
      />
    </NextLink>
  );
});

// NextLinkComposed.propTypes = {
//   href: PropTypes.any,
//   linkAs: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
//   locale: PropTypes.string,
//   passHref: PropTypes.bool,
//   prefetch: PropTypes.bool,
//   replace: PropTypes.bool,
//   scroll: PropTypes.bool,
//   shallow: PropTypes.bool,
//   to: PropTypes.oneOfType([PropTypes.object, PropTypes.string]).isRequired,
// };

export interface LinkProps extends MuiLinkProps {
  activeClassName?: string;
  as?: string | object;
  noLinkStyle?: boolean;
  role?: string;
  href?: any;
}

// A styled version of the Next.js Link component:
// https://nextjs.org/docs/api-reference/next/link
const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  function Link(props, ref) {
    const {
      activeClassName = "active",
      as: linkAs,
      className: classNameProps,
      href,
      noLinkStyle,
      role, // Link don't have roles.

      ...other
    } = props;

    const router = useRouter();
    const pathname = typeof href === "string" ? href : href?.pathname;
    const className = clsx(classNameProps, {
      [activeClassName!]: router.pathname === pathname && activeClassName,
    });

    const isExternal =
      typeof href === "string" &&
      (href.indexOf("http") === 0 || href.indexOf("mailto:") === 0);

    if (isExternal) {
      if (noLinkStyle) {
        return (
          <Anchor
            className={className}
            href={href}
            ref={ref as React.MutableRefObject<HTMLAnchorElement>}
            {...other}
          />
        );
      }

      return (
        <MuiLink
          className={className}
          href={href}
          ref={ref as React.MutableRefObject<HTMLAnchorElement>}
          {...other}
        />
      );
    }

    if (noLinkStyle) {
      return (
        <NextLinkComposed
          className={className}
          ref={ref as React.MutableRefObject<HTMLAnchorElement>}
          to={href}
          {...other}
        />
      );
    }

    return (
      <MuiLink
        component={NextLinkComposed}
        linkAs={linkAs}
        className={className}
        ref={ref as React.MutableRefObject<HTMLAnchorElement>}
        to={href}
        {...other}
      />
    );
  },
);

// Link.propTypes = {
//   activeClassName: PropTypes.string,
//   as: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
//   className: PropTypes.string,
//   href: PropTypes.any,
//   linkAs: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
//   noLinkStyle: PropTypes.bool,
//   role: PropTypes.string,
// };

export default Link;

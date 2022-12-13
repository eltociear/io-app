import React from "react";
import { Svg, Path, Rect } from "react-native-svg";
import { SVGLogoProps } from "../LogoPayment";

const LogoPaymentSatispay = ({ size }: SVGLogoProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Rect width="24" height="24" rx="4" fill="#EF373F" />
    <Path
      d="M15.938 5.73c.132-.147.039-.397-.149-.397h-3.122l1.815 2 1.456-1.604ZM11.333 10.28 9.236 8 5.391 12.18a.228.228 0 0 0 0 .304l3.845 4.182 2.097-2.281-1.747-1.9-.14-.153 1.887-2.052ZM14.483 16.667l-1.816 2h3.121c.188 0 .283-.251.15-.398l-1.455-1.602Z"
      fill="#fff"
    />
    <Path
      d="m18.606 11.856-6.433-6.462a.207.207 0 0 0-.14-.06H8.207a.209.209 0 0 0-.147.355l6.14 6.167.146.148L8.07 18.31a.209.209 0 0 0 .146.356h3.818a.207.207 0 0 0 .147-.062l6.426-6.454a.209.209 0 0 0 0-.295Z"
      fill="#fff"
    />
  </Svg>
);

export default LogoPaymentSatispay;
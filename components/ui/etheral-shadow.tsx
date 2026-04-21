'use client';

import { useEffect, useId, useRef, type CSSProperties, type ReactNode } from 'react';
import { animate, useMotionValue, type AnimationPlaybackControls } from 'framer-motion';

interface ResponsiveImage {
  src: string;
  alt?: string;
  srcSet?: string;
}

interface AnimationConfig {
  preview?: boolean;
  scale: number;
  speed: number;
}

interface NoiseConfig {
  opacity: number;
  scale: number;
}

interface ShadowOverlayProps {
  type?: 'preset' | 'custom';
  presetIndex?: number;
  customImage?: ResponsiveImage;
  sizing?: 'fill' | 'stretch';
  color?: string;
  animation?: AnimationConfig;
  noise?: NoiseConfig;
  style?: CSSProperties;
  className?: string;
  title?: string;
  description?: string;
  headingAs?: 'h1' | 'h2' | 'h3' | 'p';
  children?: ReactNode;
  decorative?: boolean;
}

function mapRange(
  value: number,
  fromLow: number,
  fromHigh: number,
  toLow: number,
  toHigh: number,
): number {
  if (fromLow === fromHigh) {
    return toLow;
  }

  const percentage = (value - fromLow) / (fromHigh - fromLow);
  return toLow + percentage * (toHigh - toLow);
}

const useInstanceId = (): string => {
  const id = useId();
  const cleanId = id.replace(/:/g, '');
  return `shadowoverlay-${cleanId}`;
};

export function Component({
  sizing = 'fill',
  color = 'rgba(128, 128, 128, 1)',
  animation,
  noise,
  style,
  className,
  title = 'Etheral Shadows',
  description,
  headingAs = 'h1',
  children,
  decorative = false,
}: ShadowOverlayProps) {
  const id = useInstanceId();
  const animationEnabled = Boolean(animation && animation.scale > 0);
  const feColorMatrixRef = useRef<SVGFEColorMatrixElement>(null);
  const hueRotateMotionValue = useMotionValue(180);
  const hueRotateAnimation = useRef<AnimationPlaybackControls | null>(null);
  const HeadingTag = headingAs;

  const animationScale = animation?.scale ?? 0;
  const displacementScale = animation ? mapRange(animation.scale, 1, 100, 20, 100) : 0;
  const animationDuration = animation ? mapRange(animation.speed, 1, 100, 1000, 50) : 1;
  const turbulenceBaseFrequency = `${mapRange(animationScale, 0, 100, 0.001, 0.0005)},${mapRange(animationScale, 0, 100, 0.004, 0.002)}`;

  useEffect(() => {
    if (!feColorMatrixRef.current || !animationEnabled) {
      return;
    }

    if (hueRotateAnimation.current) {
      hueRotateAnimation.current.stop();
    }

    hueRotateMotionValue.set(0);
    hueRotateAnimation.current = animate(hueRotateMotionValue, 360, {
      duration: animationDuration / 25,
      repeat: Infinity,
      repeatType: 'loop',
      repeatDelay: 0,
      ease: 'linear',
      delay: 0,
      onUpdate: (value: number) => {
        feColorMatrixRef.current?.setAttribute('values', String(value));
      },
    });

    return () => {
      hueRotateAnimation.current?.stop();
    };
  }, [animationDuration, animationEnabled, hueRotateMotionValue]);

  return (
    <div
      className={className}
      style={{
        overflow: 'hidden',
        position: 'relative',
        width: '100%',
        height: '100%',
        ...style,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: -displacementScale,
          filter: animationEnabled ? `url(#${id}) blur(4px)` : 'none',
        }}
      >
        {animationEnabled ? (
          <svg style={{ position: 'absolute' }} aria-hidden="true">
            <defs>
              <filter id={id}>
                <feTurbulence
                  result="undulation"
                  numOctaves="2"
                  baseFrequency={turbulenceBaseFrequency}
                  seed="0"
                  type="turbulence"
                />
                <feColorMatrix
                  ref={feColorMatrixRef}
                  in="undulation"
                  result="distortion"
                  type="hueRotate"
                  values="180"
                />
                <feColorMatrix
                  in="distortion"
                  result="circulation"
                  type="matrix"
                  values="4 0 0 0 1  4 0 0 0 1  4 0 0 0 1  1 0 0 0 0"
                />
                <feDisplacementMap
                  in="SourceGraphic"
                  in2="circulation"
                  scale={displacementScale}
                  result="dist"
                />
                <feDisplacementMap
                  in="dist"
                  in2="distortion"
                  scale={displacementScale}
                  result="output"
                />
              </filter>
            </defs>
          </svg>
        ) : null}

        <div
          style={{
            backgroundColor: color,
            maskImage:
              "url('https://framerusercontent.com/images/ceBGguIpUU8luwByxuQz79t7To.png')",
            WebkitMaskImage:
              "url('https://framerusercontent.com/images/ceBGguIpUU8luwByxuQz79t7To.png')",
            maskSize: sizing === 'stretch' ? '100% 100%' : 'cover',
            WebkitMaskSize: sizing === 'stretch' ? '100% 100%' : 'cover',
            maskRepeat: 'no-repeat',
            WebkitMaskRepeat: 'no-repeat',
            maskPosition: 'center',
            WebkitMaskPosition: 'center',
            width: '100%',
            height: '100%',
          }}
        />
      </div>

      {!decorative ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            textAlign: 'center',
            zIndex: 10,
          }}
        >
          {children ?? (
            <div className="flex max-w-4xl flex-col items-center gap-4">
              <HeadingTag className="relative z-20 text-center font-bold text-foreground md:text-7xl text-6xl lg:text-8xl">
                {title}
              </HeadingTag>
              {description ? (
                <p className="max-w-2xl text-pretty text-sm leading-7 text-foreground/80 md:text-base">
                  {description}
                </p>
              ) : null}
            </div>
          )}
        </div>
      ) : null}

      {noise && noise.opacity > 0 ? (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'url("https://framerusercontent.com/images/g0QcWrxr87K0ufOxIUFBakwYA8.png")',
            backgroundSize: noise.scale * 200,
            backgroundRepeat: 'repeat',
            opacity: noise.opacity / 2,
          }}
        />
      ) : null}
    </div>
  );
}

export { Component as EtheralShadow };

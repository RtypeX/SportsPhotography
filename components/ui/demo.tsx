import { Component } from '@/components/ui/etheral-shadow';

const DemoOne = () => {
  return (
    <div className="flex min-h-[100dvh] w-full items-center justify-center">
      <Component
        color="rgba(128, 128, 128, 1)"
        animation={{ scale: 100, speed: 90 }}
        noise={{ opacity: 1, scale: 1.2 }}
        sizing="fill"
      />
    </div>
  );
};

export { DemoOne };

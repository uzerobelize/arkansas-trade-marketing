import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  "stories": [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    "@chromatic-com/storybook",
    "@storybook/addon-vitest",
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
    "@storybook/addon-onboarding"
  ],
  "framework": "@storybook/react-vite",

  // Inject Tailwind's Vite compiler into Storybook's internal builder
  async viteFinal(config) {
    const { mergeConfig } = await import('vite');
    const { default: tailwindcss } = await import('@tailwindcss/vite');
    
    return mergeConfig(config, {
      plugins: [tailwindcss()],
    });
  }
};
export default config;

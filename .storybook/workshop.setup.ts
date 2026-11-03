import { setProjectAnnotations } from '@storybook/react-vite';
import * as preview from './preview.tsx';

// Portable stories get the same globals, decorators and CSS as the Storybook preview.
setProjectAnnotations(preview);

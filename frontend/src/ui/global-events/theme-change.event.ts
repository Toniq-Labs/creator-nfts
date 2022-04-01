import {Theme, ThemeAuto} from '@frontend/src/data/theme';
import {defineTypedEvent} from 'element-vir';

export const ThemeChangeEvent = defineTypedEvent<Theme | ThemeAuto>()('themeChange');

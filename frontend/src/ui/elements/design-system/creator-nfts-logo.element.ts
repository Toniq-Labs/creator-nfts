import {defineCreatorNftElement} from '@frontend/src/ui/define-element/define-creator-nft-element';
import {css} from 'element-vir';
import {svg} from 'lit';
import {themeForegroundPrimaryAccentColorVar} from '../../styles/theme-vars';

export const ToniqLabsLogo = defineCreatorNftElement({
    tagName: 'tcnft-toniq-labs-logo',
    styles: css`
        :host {
            display: block;
            height: 50px;
            width: 40px;
            position: relative;
        }
    `,
    props: {
        smallLogo: false,
    },
    /**
     * Currently this logo will not transition slowly between theme colors. That is because the
     * properties used in SVGs to color things, fill, stop-color, etc., are not animatable. We COULD
     * get around this by having two SVGs present on the page, one underneath the other, and
     * transitioning the opacity from one to the other. HOWEVER, so far I kinda like the fact that
     * the logo pops between theme colors but the rest of the page transitions slowly. It makes the
     * logo stand out more and it looks kinda cool.
     */
    renderCallback: ({props}) => {
        return svg`
            <svg width="100%" height="100%" viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M19.985 0a1.76 1.76 0 0 0-.811.204L.924 9.86A1.727 1.727 0 0 0 0 11.385v21.168c0 .599.314 1.157.83 1.472L27.002 50l-.095-7.628a1.676 1.676 0 0 1 .016-.246l-7.519-4.581a2.175 2.175 0 0 1-1.161.525c-1.183.151-2.267-.673-2.421-1.843a2.14 2.14 0 0 1 1.865-2.391c1.182-.152 2.267.672 2.421 1.842.037.286.014.567-.058.831l7.456 4.543c.076-.066.155-.127.243-.18l4.289-2.575-14.076-8.577a2.161 2.161 0 0 1-1.16.525c-1.184.151-2.267-.673-2.421-1.843a2.138 2.138 0 0 1 1.864-2.391c1.183-.152 2.267.672 2.421 1.842.038.287.015.567-.057.831l14.612 8.903 4.763-2.859-10.291-6.27a2.168 2.168 0 0 1-1.161.525c-1.183.152-2.267-.673-2.42-1.842a2.139 2.139 0 0 1 1.863-2.392c1.184-.152 2.268.673 2.421 1.842.038.287.016.568-.056.831l10.825 6.596c.519-.314.835-.872.835-1.473v-21.16c0-.638-.355-1.224-.924-1.525L20.826.204A1.76 1.76 0 0 0 20.015 0h-.03ZM1.665 18.523v-6.187a.23.23 0 0 1 .124-.203l16.43-8.693a.233.233 0 0 1 .343.204v6.187a.231.231 0 0 1-.123.203l-5.204 2.753a.23.23 0 0 0-.123.204v12.535a.23.23 0 0 1-.123.204l-5.53 2.925a.233.233 0 0 1-.344-.202V16.41a.233.233 0 0 0-.343-.203l-4.763 2.519a.234.234 0 0 1-.344-.203Z"
                    style="fill:${themeForegroundPrimaryAccentColorVar};"
                />
            </svg>
        `;
    },
});

import classNames from 'classnames';

import { icon_box } from './Icon.module.scss';
import IconStore from './IconStore.module.scss';

interface IconProps {
    type: string;
    size?: number;
    color?: string;
    className?: string;
}

export default function Icon({ type, size = 12, className = '', color }: IconProps) {
    const classes = classNames({
        'unimap-icon': true,
        [IconStore[`icon-${type}`]]: type,
    });
    const boxClasses = classNames({
        'flex-center': true,
        [icon_box]: true,
        [className]: className,
    });
    return (
        <div class={boxClasses}>
            <i class={classes} style={{ color, fontSize: `${size}px`, }} />
        </div>
    );
}
import { SetupContext } from 'vue';
import {
    control_box, LB, LT, RB, RT,
} from './Control.module.scss';

interface PropsType {
    space?: number;
}

const Control = {
    BOX: (props: any, { slots }: SetupContext) => <div class={control_box}>{slots.default ? slots.default() : ''}</div>,
    LT: ({ space }: PropsType, { slots }: SetupContext) => <div style={space ? {paddingTop: `${space}px`} : undefined} class={LT}>{slots.default ? slots.default() : ''}</div>,
    LB: ({ space }: PropsType, { slots }: SetupContext) => <div style={space ? {paddingBottom: `${space}px`} : undefined} class={LB}>{slots.default ? slots.default() : ''}</div>,
    RT: ({ space }: PropsType, { slots }: SetupContext) => <div style={space ? {paddingTop: `${space}px`} : undefined} class={RT}>{slots.default ? slots.default() : ''}</div>,
    RB: ({ space }: PropsType, { slots }: SetupContext) => <div style={space ? {paddingBottom: `${space}px`} : undefined} class={RB}>{slots.default ? slots.default() : ''}</div>,
};

export default Control;
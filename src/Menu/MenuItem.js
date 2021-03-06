/**
 * @file MenuItem component
 * @author qiusiqi(qiusiqi@baidu.com)
 */

import {Component, DataTypes} from 'san';
import {TouchRipple} from '../Ripple';
import {create} from '../common/util/cx';
import * as C from './constant';
import Popover from '../Popover';
import Paper from '../Paper';
import Icon from '../Icon';

const cx = create('menu-item');

/* eslint-disable */
const CASCADE_ICON = `
    <svg viewBox="0 0 24 24" class="${cx.getPartClassName('cascade-icon')}">
        <path d="M9.5,7l5,5l-5,5V7z"></path>
    </svg>
`;
/* eslint-enable */


export default class MenuItem extends Component {

    static template = `
        <div
            class="{{mainClassName}}"
            style="{{mainStyle}}"
            data-value="{{value}}"
            on-click="click($event)">
            <sm-icon
                s-if="type === 'checkbox' || type === 'radio'"
                class="${cx.getPartClassName('left-icon')}">
                {{isChecked ? 'check' : ''}}
            </sm-icon>

            <div
                class="${cx.getPartClassName('left-icon')}"
                style="{{leftIconStyle}}">
                <slot name="leftIcon" />
            </div>
            <div
                class="${cx.getPartClassName('content')}"
                style="{{titleStyle}}">
                <div class="${cx.getPartClassName('title')}">{{title}}</div>
                <div
                    s-if="!!subTitle"
                    class="${cx.getPartClassName('sub-title')}">
                    {{subTitle}}
                </div>
            </div>
            <div
                class="${cx.getPartClassName('right-icon')}"
                style="{{rightIconStyle}}">
                <slot name="rightIcon">
                    ${CASCADE_ICON}
                </slot>
            </div>
            <sm-popover
                s-if="{{cascade}}"
                open="{=subMenuOpen=}"
                getAnchor="{{getAnchor}}"
                anchorOrigin="tr"
                offsetX="{{2}}">
                <sm-paper>
                    <slot name="submenu" />
                </sm-paper>
            </sm-popover>
            <sm-touch-ripple s-if="!disabled"/>
        </div>
    `;

    static components = {
        'sm-touch-ripple': TouchRipple,
        'sm-popover': Popover,
        'sm-paper': Paper,
        'sm-icon': Icon
    };

    static computed = {
        mainClassName() {
            return cx(this)
                .addVariants({
                    'with-left-icon': this.data.get('hasLeft')
                })
                .addStates({
                    selected: this.data.get('selected')
                })
                .build();
        },
        mainStyle() {
            let hasLeft = this.data.get('hasLeft');
            let hasRight = this.data.get('hasRight');
            return hasLeft || hasRight ? {'min-width': '10rem'} : null;
        },
        leftIconStyle() {
            return {
                display: this.data.get('hasLeft') ? '' : 'none'
            };
        },
        rightIconStyle() {
            let hasRight = this.data.get('hasRight');
            return {
                display: hasRight ? '' : 'none'
            };
        },
        isChecked() {
            let type = this.data.get('type');
            let value = this.data.get('value');
            let checked = this.data.get('checked');
            if (type === 'checkbox') {
                return checked.indexOf(value) > -1;
            }
            if (type === 'radio') {
                return checked === value;
            }
            return false;
        }
    };

    static dataTypes = {
        type: DataTypes.oneOf(['command', 'checkbox', 'radio', 'option', 'expander'])
    };

    initData() {
        return {
            type: 'command',
            disabled: false,
            cascade: false,
            hasLeft: false,
            hasRight: false,
            cascadeIcon: '',
            getAnchor: this.getAnchor.bind(this),
            subMenuOpen: false
        };
    }

    inited() {

        let {cascade, type} = this.data.get();

        if (type === 'checkbox' || type === 'radio') {
            this.data.set('cascade', false);
            this.data.set('hasLeft', false);
        }
        else if (cascade) {
            this.data.set('type', 'expander');
        }

        this.dispatch(C.MENU_ITEM_INITED);

    }

    attached() {

        let slotChilds = this.slotChilds;

        let {type, cascade} = this.data.get();

        if (type !== 'checkbox' && type !== 'radio') {
            this.data.set('hasLeft', slotChilds.some(slot => slot.name === 'leftIcon'));
        }

        this.data.set(
            'hasRight',
            cascade || slotChilds.some(slot => slot.name === 'rightIcon')
        );


        this.dispatch(C.MENU_ITEM_ATTACHED);

    }

    detached() {
        this.dispatch(C.MENU_ITEM_DETACHED);
    }

    getAnchor() {
        return this.el;
    }

    click(e) {

        let {
            type,
            value,
            selected,
            checked,
            disabled,
            subMenuOpen
        } = this.data.get();

        if (disabled) {
            e.stopPropagation();
            e.preventDefault();
            return;
        }

        switch (type) {

            case 'expander': {
                this.data.set('subMenuOpen', !subMenuOpen);
                this.dispatch(
                    subMenuOpen ? C.MENU_ITEM_COLLAPSE : C.MENU_ITEM_EXPAND,
                );
                return;
            }

            case 'checkbox': {

                let nextChecked = ~checked.indexOf(value)
                    ? checked.filter(item => item !== value)
                    : [...checked, value];

                this.data.set('checked', nextChecked);
                this.fire('change');
                return;
            }

            case 'radio': {
                // 如果当前未选中，那么就选中它
                if (checked !== value) {

                    // 更新自己的 checked 状态
                    this.data.set('checked', value);

                    // 同步其他 menu-item，解除 checked 状态
                    this.dispatch(C.MENU_ITEM_RADIO_CHECKED, {value});

                    // 触发事件
                    this.fire('change', value);
                }

                return;
            }

            case 'option': {

                if (!selected) {
                    // 更新自己的 selected 状态
                    this.data.set('selected', true);

                    // 同步其他 menu-item，解除 selected 状态
                    this.dispatch(C.MENU_ITEM_OPTION_SELECTED, {value});

                    this.fire('change');
                }

                return;
            }

            case 'command':
            default: {
                this.fire('click', e);
                this.dispatch(C.MENU_COLLAPSE);
                return;
            }

        }

    }
}

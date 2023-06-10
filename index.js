'use strict';

// For reference look here: https://hyper.is/


// A custom Redux middleware that can intercept any action.
// Subsequently, we invoke the `thunk` middleware,
// which means your middleware can `next` thunks.
exports.middleware = (store) => (next) => (action) => {
    if (action.type === 'CONFIG_LOAD' ||
        action.type === 'CONFIG_RELOAD') {
        store.dispatch({
            type: 'SET_WALLPAPER_CONFIG',
            wallpaperPackConfig: action.config.wallpaperPack
        });
    }

    next(action);
};


// A custom reducer for the `ui`, `sessions` or `termgroups` state shape.
// Here we can listen for our actions & modify the state accordingly.
exports.reduceUI = (state, action) => {
    switch (action.type) {
        case 'SET_WALLPAPER_CONFIG':
            return state.set('wallpaperPackConfig', action.wallpaperPackConfig);
    }
    return state;
};

// A custom mapper for the state properties that container components receive.
exports.mapTermsState = (state, map) => {
    return Object.assign(map, {
        wallpaperPackConfig: state.ui.wallpaperPackConfig,
    });
};

// v0.5.0+. Allows you to decorate the user's configuration.
// Useful for theming or custom parameters for your plugin.
exports.decorateConfig = (config) => {

    const cssString = `
    /* Set wallpaper to fill screen */
    .hyper-wallpaper-wrapper, .hyper-wallpaper-wrapper .profile {
        width: 100%;
        height: 100%;
    }
    
    /* Semi-white faded wallpaper filter */
    .terms_termGroup {
        background: rgba(25, 25, 25, 0.7) !important
    }
    
    /* Set the tab color */
    .header_header {
        background-color: rgba(22, 22, 22);
    }
    
    /* Hide scroll bar */
    .xterm-screen {
        width: 735px;
        height: 0px !important; 
    }
    `;

    return Object.assign({}, config, {
        css: `
      ${config.css || ''} 
      ${cssString}
      `
    });
};

// Passes down props from `<TermGroup>` to the `<Term>` component.
exports.getTermProps = (uid, parentProps, props) => {
    // Make the terminal background transparent
    props.backgroundColor = 'rgba(0, 0, 0, 0)';
    return props;
};

// The `decorateTerm` hook allows our extension to return a higher order react component.
// It supplies us with:
// - Term: The terminal component.
// - React: The entire React namespace.
// - notify: Helper function for displaying notifications in the operating system.
//
// The portions of this code dealing with the particle simulation are heavily based on:
// - https://atom.io/packages/power-mode
// - https://github.com/itszero/rage-power/blob/master/index.jsx
exports.decorateTerms = (Terms, {React}) => {
    class WallPaperComponent extends React.Component {

        constructor(props, context) {
            super(props, context)
        }

        render() {

            const getImageFile = (packName) => {
                const imageMap = {
                    "jellyfish": "vino-li-gGX1fJkmw3k-unsplash.jpg"
                };

                switch (packName) {
                    case "jellyfish":
                        return imageMap["jellyfish"];
                    default:
                        return imageMap["jellyfish"];
                }
            };

            const getImagePath = (packName) =>
                 packName ?
                    `url(file://${__dirname}/res/${getImageFile(packName)}` :
                    null;

            return React.createElement('div', {
                className: 'profile',
                style: {
                    backgroundImage: getImagePath(this.props.name),
                    backgroundSize: "cover",
                    backgroundPosition: 'center',
                    backgroundColor: null,
                    display: 'block'
                },
            })
        }
    }

    return class extends React.Component {

        constructor(props, context) {
            super(props, context);
        }

        render () {
            return React.createElement(Terms, Object.assign({}, this.props, {
                customChildrenBefore: React.createElement(
                    'div',
                    {
                        className: 'hyper-wallpaper-wrapper'
                    },
                    React.createElement(WallPaperComponent, {
                        name: this.props.wallpaperPackConfig.name,
                    })
                )
            }));
        }
    };
};

const Visualizers = {
    registry: {},

    register(name, visualizer) {
        this.registry[name] = visualizer;
    },

    get(name) {
        return this.registry[name] || null;
    }
};

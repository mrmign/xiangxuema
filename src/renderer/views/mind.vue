<template>
    <div id="mind" class="view" v-if="node">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" version="1.1"
            xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs">
            <defs>
            </defs>
            <g :id="node.data.id" :class="['node','nodeGrade1',isSelected?'nodeSelected':'']"
                :transform="`translate(${node.data.x},${node.data.y})`">
                <node :key="item.data.id" :prop-data="item" v-for="item in node.children">
                </node>
                <g @click="nodeSelect">
                    <rect width="100" height="30"></rect>
                    <text transform="translate(24,20)">{{node.data.text||'[未命名]'}}</text>
                </g>
            </g>
        </svg>
    </div>
</template>
<script>
    import SVG from "svg.js"
    const fs = require('fs');
    const path = require('path');
    import node from "../components/minds/node"
    import common from "../components/minds/common"
    const {
        remote
    } = require('electron');
    export default {
        mixins: [common],
        components: {
            node
        },
        data() {
            return {
                node: null,
                recentMinds: [],
                mindPath: null
            }
        },
        beforeRouteUpdate(to, from, next) {
            next();
            // this.$refs.articleEditor.saveContent(() => {
            //     next();
            // });
        },
        beforeRouteLeave(to, from, next) {
            next();
            // this.$refs.articleEditor.saveContent(() => {
            //     
            // });
        },
        mounted() {
            let id = this.$route.params.id;
            this.getData(id);
            this.centerRootNode();
            this.newNode();
        },
        methods: {
            newNode() {
                var self = this;
                document.onkeydown = function (event) {
                    if (event.keyCode != 9) return;
                    if (self.isSelected) {
                        let x = self.node.children.length % 2 == 0 ? 200 : -200;
                        self.addSubNode(x);
                        return;
                    }
                    self.bus.$emit('addSubNode');
                }
            },
            centerRootNode() {
                this.$nextTick(() => {
                    var dom = document.getElementById("mind");
                    let y = dom.clientHeight / 2 - 15;
                    let x = dom.clientWidth / 2 - 50;
                    this.node.data.x = x;
                    this.node.data.y = y;
                })
            },
            getData(id) {
                this.mindPath = path.join(remote.app.getPath('userData'), "/xxm/m_" + id);
                let mind = fs.readFileSync(path.join(this.mindPath, "m.data"), this.$root.rwOption);
                mind = JSON.parse(mind);
                this.node = mind.root;
                this.db('minds').where("id", id).update({
                    "visited_at": new Date()
                }).then(() => {
                    this.db("minds").orderBy("visited_at", "desc").limit(8).offset(1).then(
                        recentRows => {
                            this.recentMinds = recentRows;
                        })
                });
            },
            reLocation(isRight) {
                this.switchPath('none');
                let index = isRight ? 0 : 1;
                let cur = this.node.children[index];
                let preHeight = document.getElementById(cur.data.id).getBBox().height;
                let y = 0
                cur.data.y = y;
                cur = this.node.children[index += 2];
                while (cur) {
                    let curHeight = document.getElementById(cur.data.id).getBBox().height;
                    y += curHeight / 2 + 60 + preHeight / 2;
                    cur.data.y = y;
                    preHeight = curHeight;
                    cur = this.node.children[index += 2];
                }
                let center = y / 2;
                index = isRight ? 0 : 1;
                cur = this.node.children[index];
                while (cur) {
                    cur.data.y -= center;
                    cur = this.node.children[index += 2];
                }
                this.switchPath('inherit');
            }
        }
    };
</script>
<style lang="scss" scoped>
    #mind {
        overflow: hidden;
        margin: 8px;
        margin-top: 0px;
        box-shadow: 0 1px 3px rgba(26, 26, 26, 0.2);
        height: calc(100% - 8px);
        border-radius: 3px;
        display: flex;
        flex-flow: column;
        background: #fff;
    }
</style>
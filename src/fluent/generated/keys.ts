import '@servicenow/sdk/global'

declare global {
    namespace Now {
        namespace Internal {
            interface Keys extends KeysRegistry {
                explicit: {
                    bom_json: {
                        table: 'sys_module'
                        id: '248772bdf7ae45b684bf70d1eed1126b'
                    }
                    package_json: {
                        table: 'sys_module'
                        id: 'd9684b0dbdb543f68e25e0195d35da3e'
                    }
                }
            }
        }
    }
}

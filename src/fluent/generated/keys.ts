import '@servicenow/sdk/global'

declare global {
    namespace Now {
        namespace Internal {
            interface Keys extends KeysRegistry {
                explicit: {
                    '17b05623872f8f901e7cebdd3fbb35ab': {
                        table: 'sys_scope_privilege'
                        id: '17b05623872f8f901e7cebdd3fbb35ab'
                    }
                    '4bb01623872f8f901e7cebdd3fbb357b': {
                        table: 'sys_scope_privilege'
                        id: '4bb01623872f8f901e7cebdd3fbb357b'
                    }
                    '4fb01623872f8f901e7cebdd3fbb3582': {
                        table: 'sys_scope_privilege'
                        id: '4fb01623872f8f901e7cebdd3fbb3582'
                    }
                    '6711de63872f8f901e7cebdd3fbb35ba': {
                        table: 'sys_scope_privilege'
                        id: '6711de63872f8f901e7cebdd3fbb35ba'
                    }
                    '6fb09623872f8f901e7cebdd3fbb355b': {
                        table: 'sys_scope_privilege'
                        id: '6fb09623872f8f901e7cebdd3fbb355b'
                    }
                    '9e119e63872f8f901e7cebdd3fbb358f': {
                        table: 'sys_scope_privilege'
                        id: '9e119e63872f8f901e7cebdd3fbb358f'
                    }
                    '9fb05623872f8f901e7cebdd3fbb35a5': {
                        table: 'sys_scope_privilege'
                        id: '9fb05623872f8f901e7cebdd3fbb35a5'
                    }
                    '9fb05623872f8f901e7cebdd3fbb35cb': {
                        table: 'sys_scope_privilege'
                        id: '9fb05623872f8f901e7cebdd3fbb35cb'
                    }
                    'acl-ui-kpi-report': {
                        table: 'sys_security_acl'
                        id: '32ba6f1aaf794a1a906a0bf8ee30674e'
                    }
                    'acl-ui-resource-reporting': {
                        table: 'sys_security_acl'
                        id: '79c5ca0a8687438088a699514a94fa29'
                    }
                    'acl-ui-sla-breach-dashboard': {
                        table: 'sys_security_acl'
                        id: 'c41e89d0bbef44ba8bf6a1a1049d9a07'
                    }
                    'acl-ui-task-resource-dashboard': {
                        table: 'sys_security_acl'
                        id: '1277e0dc4e524b6a86544259ff6ba934'
                    }
                    bom_json: {
                        table: 'sys_module'
                        id: '248772bdf7ae45b684bf70d1eed1126b'
                    }
                    csp_read_agg_monthly: {
                        table: 'sys_scope_privilege'
                        id: '3764b3a4fe33416cbfb191ef3a000e75'
                    }
                    csp_read_agg_weekly: {
                        table: 'sys_scope_privilege'
                        id: 'a2f8e448a90f4fc48290d820e8400395'
                    }
                    csp_read_grmember: {
                        table: 'sys_scope_privilege'
                        id: '2047118080fe4435992422c58e5eadd3'
                    }
                    csp_read_incident: {
                        table: 'sys_scope_privilege'
                        id: '4e91e24a3961468ca3ad77a3d23100cb'
                    }
                    csp_read_metric_instance: {
                        table: 'sys_scope_privilege'
                        id: 'c52f64bc122f4077844d9e73a4528d0b'
                    }
                    csp_read_sc_task: {
                        table: 'sys_scope_privilege'
                        id: 'cd00010113fe4328a17b585d7ef31455'
                    }
                    csp_read_sys_audit: {
                        table: 'sys_scope_privilege'
                        id: '3afe4ab75d1540ee95c90b21440e06a2'
                    }
                    csp_read_sys_journal: {
                        table: 'sys_scope_privilege'
                        id: 'e1e06c1f0b054abfbe58390ef4a2e73f'
                    }
                    csp_read_task_sla: {
                        table: 'sys_scope_privilege'
                        id: '3a55f90f12c041d5acebed24c6107075'
                    }
                    csp_read_time_card: {
                        table: 'sys_scope_privilege'
                        id: '08e0bc11c04a4bb5afe7c84a7727c9bf'
                    }
                    csp_read_user: {
                        table: 'sys_scope_privilege'
                        id: 'e3ce0cd510cf40729bf4e2a08c7b8ebd'
                    }
                    csp_read_user_group: {
                        table: 'sys_scope_privilege'
                        id: '76e1bb3312d04bd6b8b0aabe8820fd9b'
                    }
                    'kpi-param-end-date': {
                        table: 'sys_ws_query_parameter'
                        id: '7069667ff9fb4bcb9b16dd24d63820fa'
                    }
                    'kpi-param-group-sys-ids': {
                        table: 'sys_ws_query_parameter'
                        id: '0087cf8b3a614de8a621ffc63bbdfb31'
                    }
                    'kpi-param-limit-worknotes': {
                        table: 'sys_ws_query_parameter'
                        id: '8c59663d369249df8cb11c65db1dd3fa'
                    }
                    'kpi-param-record-refs': {
                        table: 'sys_ws_query_parameter'
                        id: '91fe434b296d44e9ba26368c939a855a'
                    }
                    'kpi-param-start-date': {
                        table: 'sys_ws_query_parameter'
                        id: '043d37c08bfa4fc494232998713d8886'
                    }
                    'kpi-param-user-sys-ids': {
                        table: 'sys_ws_query_parameter'
                        id: '6ba0de969e424a5397826da49e8dbd8a'
                    }
                    'kpi-report-api': {
                        table: 'sys_ws_definition'
                        id: '6212025bfb7f44edb0a2d8f368015638'
                    }
                    'kpi-report-report-data': {
                        table: 'sys_ws_operation'
                        id: '8d2f8ae4244c4e018ad35bebec9b7775'
                    }
                    package_json: {
                        table: 'sys_module'
                        id: 'd9684b0dbdb543f68e25e0195d35da3e'
                    }
                    'react-reports-menu': {
                        table: 'sys_app_application'
                        id: '3330affa77724bc5a869d82a724299e9'
                        deleted: true
                    }
                    'resource-reporting-api': {
                        table: 'sys_ws_definition'
                        id: 'aa987e8109cd4e94a80e7c67a1f60522'
                    }
                    'resource-reporting-module': {
                        table: 'sys_app_module'
                        id: '784920e4f0294225bd7a7a1cdeadcf28'
                        deleted: true
                    }
                    'resource-reporting-report-data': {
                        table: 'sys_ws_operation'
                        id: 'ec6c6ed38cd442b1bb8b876fac9dac7b'
                    }
                    ResourceReportAjax: {
                        table: 'sys_script_include'
                        id: 'b0d469e0a3e448fbadc6e1242794c439'
                        deleted: true
                    }
                    'rr-param-end-date': {
                        table: 'sys_ws_query_parameter'
                        id: '9281634af34c4ab4b57e96cfe849397f'
                    }
                    'rr-param-granularity': {
                        table: 'sys_ws_query_parameter'
                        id: '468fbc1e5de64f018cccc76cd946d0cd'
                    }
                    'rr-param-group-sys-ids': {
                        table: 'sys_ws_query_parameter'
                        id: 'f6e91b0a839b435eacc089edf4881748'
                        deleted: true
                    }
                    'rr-param-search-id': {
                        table: 'sys_ws_query_parameter'
                        id: '7ff148f0d1ec4bac8d011c5fddae30a5'
                    }
                    'rr-param-search-type': {
                        table: 'sys_ws_query_parameter'
                        id: 'bde50a116df64c0c85ad22aef419136d'
                    }
                    'rr-param-start-date': {
                        table: 'sys_ws_query_parameter'
                        id: '930cd285bcdd41cfa917a2d9acad8708'
                    }
                    'rr-param-user-sys-ids': {
                        table: 'sys_ws_query_parameter'
                        id: '41d86241275047cfb5d584877bd4fecf'
                        deleted: true
                    }
                    'sb-param-breaching': {
                        table: 'sys_ws_query_parameter'
                        id: 'c7c80c61a8ae490e93498b0bcbc3e446'
                    }
                    'sb-param-created-from': {
                        table: 'sys_ws_query_parameter'
                        id: 'e7ade7e4970e470b8e4c5c3cd8a6f1d5'
                    }
                    'sb-param-created-to': {
                        table: 'sys_ws_query_parameter'
                        id: '4b29ca15db4b41b8a579124d3e6a32f3'
                    }
                    'sb-param-exclude': {
                        table: 'sys_ws_query_parameter'
                        id: 'f937359786cd4c4e8f28dc37e2be22db'
                    }
                    'sb-param-group': {
                        table: 'sys_ws_query_parameter'
                        id: '0fd16e6617ad48e2b129b1ec96ec4012'
                    }
                    'sb-param-limit': {
                        table: 'sys_ws_query_parameter'
                        id: 'b8e039c421734b2982d34d438a98ed08'
                    }
                    'sb-param-offset': {
                        table: 'sys_ws_query_parameter'
                        id: '288dcc0fe2064f81b82fa33224187e13'
                    }
                    'sb-param-order-by': {
                        table: 'sys_ws_query_parameter'
                        id: '71870120d73a4614994b053b2177dffb'
                    }
                    'sb-param-order-dir': {
                        table: 'sys_ws_query_parameter'
                        id: '796cfa50f219415fbee56ba58b496679'
                    }
                    'sb-param-sla': {
                        table: 'sys_ws_query_parameter'
                        id: '42e1617a20cf40ff92a1b5cac603e443'
                    }
                    'sla-breach-api': {
                        table: 'sys_ws_definition'
                        id: 'cb446321c04f426392c1852ded53b57b'
                    }
                    'sla-breach-breaches': {
                        table: 'sys_ws_operation'
                        id: 'a9252dd3638e411da813890c265d9482'
                    }
                    'sla-breach-dashboard-module': {
                        table: 'sys_app_module'
                        id: '17b8ebd665364a6abecd676c94ae68f3'
                        deleted: true
                    }
                    'task-resource-dashboard-module': {
                        table: 'sys_app_module'
                        id: '7c9a181db18e4071b4f1280b195d3ff6'
                        deleted: true
                    }
                }
                composite: [
                    {
                        table: 'sys_ws_query_parameter_map'
                        id: '0c910795efe1454cb82df364dbb1c43c'
                        key: {
                            web_service_operation: '8d2f8ae4244c4e018ad35bebec9b7775'
                            web_service_query_parameter: '0087cf8b3a614de8a621ffc63bbdfb31'
                        }
                    },
                    {
                        table: 'sys_ui_page'
                        id: '10a87eedcc9f4da2a986b937c89a3cec'
                        key: {
                            endpoint: 'x_cahcs_react_rpt_sla_breach_dashboard.do'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: '10e83f7064864712895d3220f928c540'
                        key: {
                            sys_security_acl: '79c5ca0a8687438088a699514a94fa29'
                            sys_user_role: {
                                id: 'd6a137c7f67540f69f2827dea914a8e2'
                                key: {
                                    name: 'resource_user'
                                }
                            }
                        }
                    },
                    {
                        table: 'sn_glider_source_artifact_m2m'
                        id: '11111368ce5b46aeb6742302ad12788c'
                        key: {
                            application_file: '38d8827cae124aac8492af3aa9a2f30d'
                            source_artifact: '34c759954b6c4263b8b7d6576820f3cd'
                        }
                    },
                    {
                        table: 'sys_ws_query_parameter_map'
                        id: '12ae1e5fd1f640cebc17ff488a293e04'
                        key: {
                            web_service_operation: 'a9252dd3638e411da813890c265d9482'
                            web_service_query_parameter: 'f937359786cd4c4e8f28dc37e2be22db'
                        }
                    },
                    {
                        table: 'sys_ws_query_parameter_map'
                        id: '1fed998b2bd34c7787f79491dc44a87e'
                        key: {
                            web_service_operation: 'a9252dd3638e411da813890c265d9482'
                            web_service_query_parameter: 'c7c80c61a8ae490e93498b0bcbc3e446'
                        }
                    },
                    {
                        table: 'sn_glider_source_artifact_m2m'
                        id: '2661ee7e5f3c40429fdfb6a988dcdfc1'
                        key: {
                            application_file: 'f5f4dcef633a4d55af2ed1b6af98d71b'
                            source_artifact: 'a104ceafdbb14f8687aac17c3a02bcd6'
                        }
                    },
                    {
                        table: 'sys_ws_query_parameter_map'
                        id: '2e1526e5e12043359eeb7bab487cd052'
                        key: {
                            web_service_operation: 'a9252dd3638e411da813890c265d9482'
                            web_service_query_parameter: '0fd16e6617ad48e2b129b1ec96ec4012'
                        }
                    },
                    {
                        table: 'sn_glider_source_artifact_m2m'
                        id: '2f7628e5b8c74f76b9a0d5fb77bae0a7'
                        key: {
                            application_file: 'dd9b410d557a40878c7f129fce42da91'
                            source_artifact: 'a104ceafdbb14f8687aac17c3a02bcd6'
                        }
                    },
                    {
                        table: 'sn_glider_source_artifact'
                        id: '34c759954b6c4263b8b7d6576820f3cd'
                        key: {
                            name: 'x_cahcs_react_rpt_kpi_report.do - BYOUI Files'
                        }
                    },
                    {
                        table: 'sys_ux_lib_asset'
                        id: '38d8827cae124aac8492af3aa9a2f30d'
                        key: {
                            name: 'x_cahcs_react_rpt/kpi-report/main.js.map'
                        }
                    },
                    {
                        table: 'sys_ws_query_parameter_map'
                        id: '3be7028bbfd145cc9936d5c04f5e3b01'
                        key: {
                            web_service_operation: 'a9252dd3638e411da813890c265d9482'
                            web_service_query_parameter: '4b29ca15db4b41b8a579124d3e6a32f3'
                        }
                    },
                    {
                        table: 'sn_glider_source_artifact_m2m'
                        id: '4d7995b8059943299db5e4af144ff31e'
                        key: {
                            application_file: '65ca19ad23ce47d894d39fb1053cc554'
                            source_artifact: '34c759954b6c4263b8b7d6576820f3cd'
                        }
                    },
                    {
                        table: 'sys_ws_query_parameter_map'
                        id: '587b12873f01419f9dd959318fbf2103'
                        key: {
                            web_service_operation: 'ec6c6ed38cd442b1bb8b876fac9dac7b'
                            web_service_query_parameter: '7ff148f0d1ec4bac8d011c5fddae30a5'
                        }
                    },
                    {
                        table: 'sys_ws_query_parameter_map'
                        id: '6247c909d95d4db7a7fda5b5991fe5a7'
                        key: {
                            web_service_operation: 'a9252dd3638e411da813890c265d9482'
                            web_service_query_parameter: '796cfa50f219415fbee56ba58b496679'
                        }
                    },
                    {
                        table: 'sys_ws_query_parameter_map'
                        id: '628b167770d84bf1b69fac76b1961974'
                        key: {
                            web_service_operation: '8d2f8ae4244c4e018ad35bebec9b7775'
                            web_service_query_parameter: '91fe434b296d44e9ba26368c939a855a'
                        }
                    },
                    {
                        table: 'sys_ux_lib_asset'
                        id: '63be7aad82ba4df7b1587ecd6132c3aa'
                        key: {
                            name: 'x_cahcs_react_rpt/resource-reporting/main'
                        }
                    },
                    {
                        table: 'sys_ui_page'
                        id: '65ca19ad23ce47d894d39fb1053cc554'
                        key: {
                            endpoint: 'x_cahcs_react_rpt_kpi_report.do'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: '69a643bddfe1425ea00a991ffc4537bf'
                        key: {
                            sys_security_acl: '1277e0dc4e524b6a86544259ff6ba934'
                            sys_user_role: {
                                id: '4557bdcb334a4c4c84478e102f93bf69'
                                key: {
                                    name: 'itil'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: '6e39547fe7594d8ea6dc55a66542a5eb'
                        key: {
                            sys_security_acl: 'c41e89d0bbef44ba8bf6a1a1049d9a07'
                            sys_user_role: {
                                id: '4557bdcb334a4c4c84478e102f93bf69'
                                key: {
                                    name: 'itil'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_ws_query_parameter_map'
                        id: '6f2a1afd12e64a1e874ecb43747c3f71'
                        key: {
                            web_service_operation: 'ec6c6ed38cd442b1bb8b876fac9dac7b'
                            web_service_query_parameter: '930cd285bcdd41cfa917a2d9acad8708'
                        }
                    },
                    {
                        table: 'sys_ws_query_parameter_map'
                        id: '7a5358f5d3fb418983a206bbdef17dec'
                        key: {
                            web_service_operation: '8d2f8ae4244c4e018ad35bebec9b7775'
                            web_service_query_parameter: '8c59663d369249df8cb11c65db1dd3fa'
                        }
                    },
                    {
                        table: 'sys_ux_lib_asset'
                        id: '7a846135b3c14ec78116a129d417acbd'
                        key: {
                            name: 'x_cahcs_react_rpt/sla-breach/main'
                        }
                    },
                    {
                        table: 'sn_glider_source_artifact_m2m'
                        id: '809e0a0dad0b4c679bf584ea63c9a17c'
                        key: {
                            application_file: '99ded1fe536b4430a007fba321ee097f'
                            source_artifact: '34c759954b6c4263b8b7d6576820f3cd'
                        }
                    },
                    {
                        table: 'sys_ui_page'
                        id: '81afa6e41e2f445e8ed38d83c3a2974f'
                        key: {
                            endpoint: 'x_cahcs_react_rpt_resource_reporting.do'
                        }
                    },
                    {
                        table: 'sys_ux_lib_asset'
                        id: '83c8b9abee43470eb18b5257f5b4e042'
                        key: {
                            name: 'x_cahcs_react_rpt/resource-reporting/main.js.map'
                        }
                    },
                    {
                        table: 'sys_ws_query_parameter_map'
                        id: '8ad5b0802b124c699db9fcc022bffef6'
                        key: {
                            web_service_operation: '8d2f8ae4244c4e018ad35bebec9b7775'
                            web_service_query_parameter: '043d37c08bfa4fc494232998713d8886'
                        }
                    },
                    {
                        table: 'sys_ws_query_parameter_map'
                        id: '8dae034fff82429aa263c929634dbf21'
                        key: {
                            web_service_operation: 'a9252dd3638e411da813890c265d9482'
                            web_service_query_parameter: '42e1617a20cf40ff92a1b5cac603e443'
                        }
                    },
                    {
                        table: 'sn_glider_source_artifact_m2m'
                        id: '93a13d313e0a4ba489dc0c7ae9e5b66b'
                        key: {
                            application_file: '7a846135b3c14ec78116a129d417acbd'
                            source_artifact: 'dfbf85ece4d447d58faa0fac760cf221'
                        }
                    },
                    {
                        table: 'sys_ux_lib_asset'
                        id: '99ded1fe536b4430a007fba321ee097f'
                        key: {
                            name: 'x_cahcs_react_rpt/kpi-report/main'
                        }
                    },
                    {
                        table: 'sn_glider_source_artifact'
                        id: 'a104ceafdbb14f8687aac17c3a02bcd6'
                        key: {
                            name: 'x_cahcs_react_rpt_task_resource_dashboard.do - BYOUI Files'
                        }
                    },
                    {
                        table: 'sys_ws_query_parameter_map'
                        id: 'aa0891417fe74261945389aa8fd9bc4e'
                        key: {
                            web_service_operation: '8d2f8ae4244c4e018ad35bebec9b7775'
                            web_service_query_parameter: '7069667ff9fb4bcb9b16dd24d63820fa'
                        }
                    },
                    {
                        table: 'sys_ws_query_parameter_map'
                        id: 'ae08aac7528f4339ac8aeaa450da5f1f'
                        key: {
                            web_service_operation: 'a9252dd3638e411da813890c265d9482'
                            web_service_query_parameter: 'e7ade7e4970e470b8e4c5c3cd8a6f1d5'
                        }
                    },
                    {
                        table: 'sn_glider_source_artifact_m2m'
                        id: 'b0973bd907f948658b3d9a04538fa167'
                        key: {
                            application_file: '81afa6e41e2f445e8ed38d83c3a2974f'
                            source_artifact: 'ecabea1e10df410e8479e8cbd110b423'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: 'b52001fc1cee4b4f92ab8dfd6ebbedbe'
                        deleted: true
                        key: {
                            sys_security_acl: '79c5ca0a8687438088a699514a94fa29'
                            sys_user_role: {
                                id: '4557bdcb334a4c4c84478e102f93bf69'
                                key: {
                                    name: 'itil'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_ws_query_parameter_map'
                        id: 'c88086773d524f8080f1c9e40fcf3450'
                        key: {
                            web_service_operation: 'a9252dd3638e411da813890c265d9482'
                            web_service_query_parameter: 'b8e039c421734b2982d34d438a98ed08'
                        }
                    },
                    {
                        table: 'sn_glider_source_artifact_m2m'
                        id: 'cb786a693b33495aa383274790adf1fb'
                        key: {
                            application_file: 'fa31ab53adf74e42a818b1a8a93090a1'
                            source_artifact: 'a104ceafdbb14f8687aac17c3a02bcd6'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: 'cbbdfe3b14944f858c08bbefac3d0e41'
                        key: {
                            sys_security_acl: '32ba6f1aaf794a1a906a0bf8ee30674e'
                            sys_user_role: {
                                id: '4557bdcb334a4c4c84478e102f93bf69'
                                key: {
                                    name: 'itil'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_ws_query_parameter_map'
                        id: 'cfc5e62d04de42dc8ab05debd6b6b142'
                        key: {
                            web_service_operation: 'a9252dd3638e411da813890c265d9482'
                            web_service_query_parameter: '71870120d73a4614994b053b2177dffb'
                        }
                    },
                    {
                        table: 'sys_ws_query_parameter_map'
                        id: 'cfc70e31526243249c697112f0619738'
                        key: {
                            web_service_operation: 'ec6c6ed38cd442b1bb8b876fac9dac7b'
                            web_service_query_parameter: '9281634af34c4ab4b57e96cfe849397f'
                        }
                    },
                    {
                        table: 'sn_glider_source_artifact_m2m'
                        id: 'd1e0a3bddf1a42089ee2eff06d45abd9'
                        key: {
                            application_file: '63be7aad82ba4df7b1587ecd6132c3aa'
                            source_artifact: 'ecabea1e10df410e8479e8cbd110b423'
                        }
                    },
                    {
                        table: 'sn_glider_source_artifact_m2m'
                        id: 'd3d9988c87ab4bb88db5864cc62a8917'
                        key: {
                            application_file: '10a87eedcc9f4da2a986b937c89a3cec'
                            source_artifact: 'dfbf85ece4d447d58faa0fac760cf221'
                        }
                    },
                    {
                        table: 'sn_glider_source_artifact_m2m'
                        id: 'd3ede6addbcc42cc8a53fc77b06e56ff'
                        key: {
                            application_file: 'eb7c6952704f49dca72f30b08b3443c2'
                            source_artifact: 'dfbf85ece4d447d58faa0fac760cf221'
                        }
                    },
                    {
                        table: 'sn_glider_source_artifact_m2m'
                        id: 'dbb195a3698e48998a6af21cc4069215'
                        key: {
                            application_file: '83c8b9abee43470eb18b5257f5b4e042'
                            source_artifact: 'ecabea1e10df410e8479e8cbd110b423'
                        }
                    },
                    {
                        table: 'sys_ws_query_parameter_map'
                        id: 'dbe01489e85340858a2a4bca577c0592'
                        deleted: true
                        key: {
                            web_service_operation: 'ec6c6ed38cd442b1bb8b876fac9dac7b'
                            web_service_query_parameter: '41d86241275047cfb5d584877bd4fecf'
                        }
                    },
                    {
                        table: 'sys_ux_lib_asset'
                        id: 'dd9b410d557a40878c7f129fce42da91'
                        key: {
                            name: 'x_cahcs_react_rpt/task-resource-dashboard/main'
                        }
                    },
                    {
                        table: 'sys_ws_query_parameter_map'
                        id: 'de2dcaac62374f2aae82ee0344ec7fc1'
                        key: {
                            web_service_operation: '8d2f8ae4244c4e018ad35bebec9b7775'
                            web_service_query_parameter: '6ba0de969e424a5397826da49e8dbd8a'
                        }
                    },
                    {
                        table: 'sn_glider_source_artifact'
                        id: 'dfbf85ece4d447d58faa0fac760cf221'
                        key: {
                            name: 'x_cahcs_react_rpt_sla_breach_dashboard.do - BYOUI Files'
                        }
                    },
                    {
                        table: 'sys_ws_query_parameter_map'
                        id: 'e1b336ff65ce4e9e97a3804fa318f628'
                        key: {
                            web_service_operation: 'a9252dd3638e411da813890c265d9482'
                            web_service_query_parameter: '288dcc0fe2064f81b82fa33224187e13'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: 'e491a0214b304a1eb9965b080019b91a'
                        key: {
                            sys_security_acl: '79c5ca0a8687438088a699514a94fa29'
                            sys_user_role: {
                                id: 'f20963ac8bbe4cf18a7c870238eeac02'
                                key: {
                                    name: 'resource_manager'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: 'e5376dbfcb364780a42995e0938faccf'
                        key: {
                            sys_security_acl: '79c5ca0a8687438088a699514a94fa29'
                            sys_user_role: {
                                id: '861f71c4865f44a9920f265225e53c13'
                                key: {
                                    name: 'sn_ppm_read'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_ws_query_parameter_map'
                        id: 'e703a51aefbd4117bc3b7c86772cf46a'
                        deleted: true
                        key: {
                            web_service_operation: 'ec6c6ed38cd442b1bb8b876fac9dac7b'
                            web_service_query_parameter: 'f6e91b0a839b435eacc089edf4881748'
                        }
                    },
                    {
                        table: 'sys_ws_query_parameter_map'
                        id: 'e77accd21dd649349d4933c350b7eed4'
                        key: {
                            web_service_operation: 'ec6c6ed38cd442b1bb8b876fac9dac7b'
                            web_service_query_parameter: 'bde50a116df64c0c85ad22aef419136d'
                        }
                    },
                    {
                        table: 'sys_ux_lib_asset'
                        id: 'eb7c6952704f49dca72f30b08b3443c2'
                        key: {
                            name: 'x_cahcs_react_rpt/sla-breach/main.js.map'
                        }
                    },
                    {
                        table: 'sn_glider_source_artifact'
                        id: 'ecabea1e10df410e8479e8cbd110b423'
                        key: {
                            name: 'x_cahcs_react_rpt_resource_reporting.do - BYOUI Files'
                        }
                    },
                    {
                        table: 'sys_ux_lib_asset'
                        id: 'f5f4dcef633a4d55af2ed1b6af98d71b'
                        key: {
                            name: 'x_cahcs_react_rpt/task-resource-dashboard/main.js.map'
                        }
                    },
                    {
                        table: 'sys_ui_page'
                        id: 'fa31ab53adf74e42a818b1a8a93090a1'
                        key: {
                            endpoint: 'x_cahcs_react_rpt_task_resource_dashboard.do'
                        }
                    },
                    {
                        table: 'sys_ws_query_parameter_map'
                        id: 'fc964dcf6ec346b19c70ec016b5c60b8'
                        key: {
                            web_service_operation: 'ec6c6ed38cd442b1bb8b876fac9dac7b'
                            web_service_query_parameter: '468fbc1e5de64f018cccc76cd946d0cd'
                        }
                    },
                ]
            }
        }
    }
}

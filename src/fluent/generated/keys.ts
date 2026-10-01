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
                    csp_read_time_card: {
                        table: 'sys_scope_privilege'
                        id: '08e0bc11c04a4bb5afe7c84a7727c9bf'
                    }
                    csp_read_user: {
                        table: 'sys_scope_privilege'
                        id: 'e3ce0cd510cf40729bf4e2a08c7b8ebd'
                    }
                    package_json: {
                        table: 'sys_module'
                        id: 'd9684b0dbdb543f68e25e0195d35da3e'
                    }
                    'react-reports-menu': {
                        table: 'sys_app_application'
                        id: '3330affa77724bc5a869d82a724299e9'
                    }
                    'resource-reporting-api': {
                        table: 'sys_ws_definition'
                        id: 'aa987e8109cd4e94a80e7c67a1f60522'
                    }
                    'resource-reporting-module': {
                        table: 'sys_app_module'
                        id: '784920e4f0294225bd7a7a1cdeadcf28'
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
                }
                composite: [
                    {
                        table: 'sys_ws_query_parameter_map'
                        id: '587b12873f01419f9dd959318fbf2103'
                        key: {
                            web_service_operation: 'ec6c6ed38cd442b1bb8b876fac9dac7b'
                            web_service_query_parameter: '7ff148f0d1ec4bac8d011c5fddae30a5'
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
                        table: 'sys_ws_query_parameter_map'
                        id: '6f2a1afd12e64a1e874ecb43747c3f71'
                        key: {
                            web_service_operation: 'ec6c6ed38cd442b1bb8b876fac9dac7b'
                            web_service_query_parameter: '930cd285bcdd41cfa917a2d9acad8708'
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
                        table: 'sn_glider_source_artifact_m2m'
                        id: 'b0973bd907f948658b3d9a04538fa167'
                        key: {
                            application_file: '81afa6e41e2f445e8ed38d83c3a2974f'
                            source_artifact: 'ecabea1e10df410e8479e8cbd110b423'
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
                        table: 'sn_glider_source_artifact'
                        id: 'ecabea1e10df410e8479e8cbd110b423'
                        key: {
                            name: 'x_cahcs_react_rpt_resource_reporting.do - BYOUI Files'
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

'use strict';

/*
 * Öffentliche Browser-Konfiguration. Der Publishable Key ist ausdrücklich kein
 * Geheimnis; sämtliche Zugriffe werden zusätzlich durch Row Level Security
 * geschützt. Ein Secret- oder service_role-Key gehört niemals in diese Datei.
 */
(function installSupabaseConfig(global){
  global.EberosSupabaseConfig=Object.freeze({
    enabled:true,
    url:'https://qcpwzvlucqcirrozxywt.supabase.co',
    publishableKey:'sb_publishable_RchsOhgwJJMsGwdiuthR_g_vl4zmRit',
    sdkVersion:'2.117.2',
    sdkPath:'./data/vendor/supabase-2.117.2.js?v=1.8.1-gm-sessions-cbp-figures-coldloadfix'
  });
})(globalThis);


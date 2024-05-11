import React from 'react';
import { dashboard, bitable, DashboardState } from "@lark-base-open/js-sdk";
import { useState, useEffect, useRef, useCallback } from 'react';
import { Button, ConfigProvider, Input } from 'antd';
import enUS from 'antd/locale/en_US';
import zhCN from 'antd/locale/zh_CN';
import './App.css';
import classnames from 'classnames'
import { debounce } from 'lodash';


interface IPreviewConfig {
  url: string
}

function App() {

  const [locale, setLocale] = useState(zhCN);

  const [config, setConfig] = useState<IPreviewConfig>({
    url: ""
  })

  const [inputValue, setInputValue] = useState('');

  const isCreate = dashboard.state === DashboardState.Create
  /** 是否配置模式下 */
  const isConfig = dashboard.state === DashboardState.Config || isCreate;

  const updateConfig = (res: any) => {
    const { customConfig } = res;
    if (customConfig) {
      setConfig(customConfig as any)
      setInputValue(customConfig.url)
      setTimeout(() => {
        // 预留3s给浏览器进行渲染，3s后告知服务端可以进行截图了
        dashboard.setRendered();
      }, 3000);
    }
  }

  React.useEffect(() => {
    // getV();
    if (isCreate) {
      return
    }
    // 初始化获取配置
    dashboard.getConfig().then(updateConfig);
  }, []);


  React.useEffect(() => {
    const offConfigChange = dashboard.onConfigChange((r) => {
      // 监听配置变化，协同修改配置
      updateConfig(r.data);
    });
    return () => {
      offConfigChange();
    }
  }, []);

  const debounceSetConfig = useCallback(debounce((value: string) => {
    setConfig({
      ...config,
      url: value
    })
  }, 500), []);

  useEffect(() => {
    debounceSetConfig(inputValue)
  }, [inputValue, debounceSetConfig])

  function saveConfig() {
    console.log(config);
    // 保存配置
    dashboard.saveConfig({
      customConfig: config,
      dataConditions: [],
    } as any)
  }

  return (
    <main className={classnames({
      'main-config': isConfig,
      'main': true,
    })}>

      <ConfigProvider locale={locale}>

        <div className='content'>
          {config.url ? (
            <iframe className="container" src={config.url} />
          ) : (
            <center className="container">请输入需要嵌入的网页链接</center>
          )}
        </div>
        {
          isConfig && (
            <div className='config-panel'>
              <div className='form'>
                <div className='form-item'>
                  <div className='label'>网页链接:</div>
                  <Input value={inputValue} placeholder="请输入需要嵌入的网页链接" onChange={(e) => setInputValue(e.target.value)}></Input>
                </div>
              </div>
              <Button
                className='btn'
                size="middle"
                type="primary"
                autoInsertSpace={false}
                onClick={saveConfig}
              >
                确定
              </Button>
            </div>
          )
        }
      </ConfigProvider>
    </main>
  );
}

export default App;

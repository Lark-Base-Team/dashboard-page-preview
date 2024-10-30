import { useTranslation } from "react-i18next";
import { dashboard, DashboardState } from "@lark-base-open/js-sdk";
import React, { useState, useEffect, useCallback } from "react";
import { Button, Input, Image, Space, Form } from "@douyinfe/semi-ui";
import { useTheme, useConfig } from "./hooks/index";
import '@lark-base-open/js-sdk/dist/style/dashboard.css';
import "./App.scss";
import classnames from "classnames";
import { debounce } from "lodash";

interface IPreviewConfig {
  url: string;
}

function App() {
  const { bgColor } = useTheme();

  const [config, setConfig] = useState<IPreviewConfig>({
    url: "",
  });

  const [inputValue, setInputValue] = useState("");

  const isCreate = dashboard.state === DashboardState.Create;
  /** 是否配置模式下 */
  const isConfig = dashboard.state === DashboardState.Config || isCreate;

  const { t } = useTranslation();

  const updateConfig = (res: any) => {
    const { customConfig } = res;
    if (customConfig) {
      setConfig(customConfig as any);
      setInputValue(customConfig.url);
      setTimeout(() => {
        // 预留3s给浏览器进行渲染，3s后告知服务端可以进行截图了
        dashboard.setRendered();
      }, 1000 * 25); // 3秒可能太短了，多一点试试
    }
  };

  useConfig(updateConfig);

  const debounceSetConfig = useCallback(
    debounce((value: string) => {
      setConfig({
        ...config,
        url: value,
      });
    }, 500),
    []
  );

  useEffect(() => {
    debounceSetConfig(inputValue);
  }, [inputValue, debounceSetConfig]);

  function saveConfig() {
    console.log(config);
    // 保存配置
    dashboard.saveConfig({
      customConfig: config,
      dataConditions: [],
    } as any);
  }

  return (
    <main style={{backgroundColor: bgColor}} className={classnames({"main-config": isConfig, main: true})}>
      <div className="content">
        {config.url ? (
          <iframe className="container" src={config.url} />
        ) : (
          <center className="container">
            <Space vertical>
              <Image src="./empty.svg" preview={false} />
              <span className="url-empty">{t("placeholder.urlEmpty")}</span>
            </Space>
          </center>
        )}
      </div>
      {isConfig && (
        <div className="config-panel">
          <Form className="form">
            <div className="form-item">
              <Form.Label className="label">{t("label.link")}</Form.Label>
              <Input
                value={inputValue}
                placeholder={t("placeholder.link")}
                onChange={setInputValue}
                className="input"
              ></Input>
            </div>
          </Form>
          <Button
            type="primary"
            theme="solid"
            className="btn"
            onClick={saveConfig}
          >
            确定
          </Button>
        </div>
      )}
    </main>
  );
}

export default App;

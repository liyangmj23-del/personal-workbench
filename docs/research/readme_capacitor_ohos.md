# capacitor-ohos
Simple implementation for capacitor to work with ohos platform(OpenHarmony / HarmonyOS next) 
Other languages: [中文繁體](./README_ZH_HK.md) | [中文简体](./README_ZH_CN.md)

## Usage
1. Create the capacitor project [instructions](https://capacitorjs.com/docs/getting-started)
2. Clone this repo
3. run `cd capacitor-ohos && ./cap_ohos_script.sh init`  to setup the ohos platform in your capacitor project
4. Then, you can use the script to sync, build and run the ohos project
5. For setting up the ohos development environment, please refer to the [official documentation](https://developer.huawei.com/consumer/en/doc/harmonyos-guides/start-overview)

## cap_ohos_script.sh usage
```sh
./cap_ohos_script.sh init [path-to-capacitor-project]
./cap_ohos_script.sh sync
./cap_ohos_script.sh build [--no-sync]
./cap_ohos_script.sh run   [--no-sync]
```
> Similar to capacitor cli commands

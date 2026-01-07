# Copyright 2025 Service Well AB
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

version="0.9.0-preview-build20250328.13"

if [ ! -d "engine-tmp" ]; then
    mkdir ./engine-tmp
fi
curl --location --request GET "https://www.nuget.org/api/v2/package/Servicewell.Fhir.Liquid.Converter.Tool/${version}" -o ./engine-tmp/engine.nupkg

unzip -o ./engine-tmp/engine.nupkg -d ./engine-tmp
if [ ! -d "engine" ]; then
    mkdir ./engine
else
    rm -r ./engine/*
fi
mv ./engine-tmp/contentFiles/any/net8.0/Microsoft.Health.Fhir.Liquid.Converter.Tool/* ./engine/
rm -r engine-tmp
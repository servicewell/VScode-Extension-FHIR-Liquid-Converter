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
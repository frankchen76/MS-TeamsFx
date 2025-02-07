<Project Sdk="Microsoft.NET.Sdk.Web">

  <PropertyGroup>
    <TargetFramework>{{TargetFramework}}</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>

  <ItemGroup>
    <ProjectCapability Include="TeamsFx" />
  </ItemGroup>

  <ItemGroup>
    <None Remove="build/**/*" />
    <None Remove="devTools/**" />
    <Content Remove="build/**/*" />
    <Content Remove="devTools/**/*" />
  </ItemGroup>

  <ItemGroup>
    <None Include=".notification.local*.json" />
    <None Include=".notification.testtool*.json" />
  </ItemGroup>

  <ItemGroup>
    <PackageReference Include="AdaptiveCards.Templating" Version="1.3.1" />
    <PackageReference Include="Microsoft.Bot.Builder.Integration.AspNet.Core" Version="4.21.1" />
    <PackageReference Include="Microsoft.TeamsFx" Version="2.4.*">
      <!-- Exclude TeamsFx wwwroot static files which are for frontend only. -->
      <ExcludeAssets>contentFiles</ExcludeAssets>
    </PackageReference>
  </ItemGroup>

</Project>

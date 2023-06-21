import { DefaultNamingStrategy, NamingStrategyInterface } from 'typeorm';
import { snakeCase } from 'typeorm/util/StringUtils';

import * as pluralize from 'pluralize';

// having to make one of these custom is really troll

/**
 * This naming strategy follows the following conventions:
 * 1. Pluralized snake_case entity names. Example: PhotoAlbum -> photo_albums, PackageDelivery -> package_deliveries
 * 2. snake_case column names
 */
export class PluralSnakeCaseNamingStrategy
  extends DefaultNamingStrategy
  implements NamingStrategyInterface
{
  public tableName(targetName: string, userSpecifiedName: string): string {
    return userSpecifiedName
      ? userSpecifiedName
      : pluralize(snakeCase(targetName));
  }

  public columnName(
    propertyName: string,
    customName: string,
    embeddedPrefixes: string[],
  ): string {
    if (embeddedPrefixes.length)
      return (
        embeddedPrefixes.join('_') +
        '_' +
        (customName ? snakeCase(customName) : snakeCase(propertyName))
      );

    return customName ? customName : snakeCase(propertyName);
  }

  public joinColumnName(
    relationName: string,
    referencedColumnName: string,
  ): string {
    return snakeCase(super.joinColumnName(relationName, referencedColumnName));
  }
}
